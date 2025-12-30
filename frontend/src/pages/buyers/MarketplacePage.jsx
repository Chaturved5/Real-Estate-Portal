import { useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import PropertyCard from "../../components/PropertyCard"
import { useMarketplace } from "../../context/MarketplaceContext.jsx"

const formatPriceCr = (price) => `₹${(price / 10000000).toFixed(2)} Cr`
const titleCase = (value) => value.charAt(0).toUpperCase() + value.slice(1)
const createInitialFilters = () => ({
  location: "",
  type: "",
  minPrice: "",
  maxPrice: "",
  bedrooms: ""
})

const sortProperties = (list, sortBy) => {
  const ordered = [...list]
  switch (sortBy) {
    case "priceLowHigh":
      return ordered.sort((a, b) => a.price - b.price)
    case "priceHighLow":
      return ordered.sort((a, b) => b.price - a.price)
    case "areaHighLow":
      return ordered.sort((a, b) => b.area - a.area)
    case "bedroomsHighLow":
      return ordered.sort((a, b) => b.bedrooms - a.bedrooms)
    default:
      return ordered.sort((a, b) => {
        if (b.rating === a.rating) {
          return a.price - b.price
        }
        return b.rating - a.rating
      })
  }
}

const sortOptions = [
  { value: "recommended", label: "Recommended" },
  { value: "priceLowHigh", label: "Price: Low to High" },
  { value: "priceHighLow", label: "Price: High to Low" },
  { value: "areaHighLow", label: "Area: Large to Compact" },
  { value: "bedroomsHighLow", label: "Bedrooms: Most to Fewest" }
]

const bedroomOptions = [
  { value: "", label: "Any" },
  { value: "1", label: "1+" },
  { value: "2", label: "2+" },
  { value: "3", label: "3+" },
  { value: "4", label: "4+" }
]

const MarketplacePage = () => {
  const navigate = useNavigate()
  const { properties, searchProperties } = useMarketplace()

  const [filters, setFilters] = useState(() => createInitialFilters())
  const [sortBy, setSortBy] = useState("recommended")

  const handleFilterChange = (key) => (event) => {
    const { value } = event.target
    setFilters((previous) => ({ ...previous, [key]: value }))
  }

  const resetFilters = () => {
    setFilters(createInitialFilters())
    setSortBy("recommended")
  }

  const typeCatalog = useMemo(() => {
    const tally = properties.reduce((accumulator, property) => {
      accumulator[property.type] = (accumulator[property.type] || 0) + 1
      return accumulator
    }, {})

    return Object.entries(tally)
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count)
  }, [properties])

  const filteredProperties = useMemo(() => {
    const results = searchProperties({
      city: filters.location,
      type: filters.type,
      minPrice: filters.minPrice,
      maxPrice: filters.maxPrice,
      bedrooms: filters.bedrooms
    })

    return sortProperties(results, sortBy)
  }, [filters, searchProperties, sortBy])

  const activeFilters = useMemo(() => Object.values(filters).filter(Boolean).length, [filters])

  const priceStats = useMemo(() => {
    if (!filteredProperties.length) {
      return null
    }

    const prices = filteredProperties.map((property) => property.price)
    const min = Math.min(...prices)
    const max = Math.max(...prices)
    const avg = prices.reduce((total, value) => total + value, 0) / prices.length

    return { min, max, avg }
  }, [filteredProperties])

  const typeBreakdown = useMemo(() => {
    const tally = filteredProperties.reduce((accumulator, property) => {
      accumulator[property.type] = (accumulator[property.type] || 0) + 1
      return accumulator
    }, {})

    return Object.entries(tally)
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count)
  }, [filteredProperties])

  const handleQuickType = (type) => {
    setFilters((previous) => ({
      ...previous,
      type: previous.type === type ? "" : type
    }))
  }

  const handleViewProperty = (propertyId) => {
    navigate(`/property/${propertyId}`)
  }

  const resultsLabel = filteredProperties.length === 1 ? "1 property matches your filters" : `${filteredProperties.length} properties match your filters`

  return (
    <div className="py-10 sm:py-12 max-[517px]:py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 max-[517px]:px-3">
        <div className="page-panel p-6 sm:p-8 lg:p-10 max-[517px]:p-4 space-y-8 max-[517px]:space-y-6">
          <header className="space-y-3">
            <p className="text-sm font-semibold uppercase tracking-wider text-green-700">Marketplace</p>
            <h1 className="text-3xl sm:text-4xl max-[517px]:text-2xl font-bold text-green-900">Browse Exclusive Listings</h1>
            <p className="text-gray-600 text-sm sm:text-base max-[517px]:text-[13px] max-w-3xl">
              Filter by location, budget, property type, and size to discover listings that match your investment strategy or dream home vision.
            </p>
          </header>

          <section className="bg-white rounded-2xl shadow-sm p-6 sm:p-8 max-[517px]:p-4 space-y-6 max-[517px]:space-y-4">
            <form className="grid gap-4 max-[517px]:gap-3 sm:grid-cols-2 lg:grid-cols-4" onSubmit={(event) => event.preventDefault()}>
              <div>
                <label className="block text-xs font-semibold text-green-900 uppercase tracking-wide mb-2" htmlFor="marketplace-location">
                  Location
                </label>
                <input
                  id="marketplace-location"
                  type="text"
                  value={filters.location}
                  onChange={handleFilterChange("location")}
                  placeholder="Search by city..."
                  className="w-full border border-gray-200 rounded-lg px-3 sm:px-4 py-2.5 max-[517px]:py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-green-900 uppercase tracking-wide mb-2" htmlFor="marketplace-type">
                  Property Type
                </label>
                <select
                  id="marketplace-type"
                  value={filters.type}
                  onChange={handleFilterChange("type")}
                  className="w-full border border-gray-200 rounded-lg px-3 sm:px-4 py-2.5 max-[517px]:py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
                >
                  <option value="">All Types</option>
                  {typeCatalog.map(({ type }) => (
                    <option key={type} value={type}>
                      {titleCase(type)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-green-900 uppercase tracking-wide mb-2" htmlFor="marketplace-min-price">
                  Min Budget (Cr)
                </label>
                <input
                  id="marketplace-min-price"
                  type="number"
                  min="0"
                  step="0.1"
                  value={filters.minPrice}
                  onChange={handleFilterChange("minPrice")}
                  placeholder="2.5"
                  className="w-full border border-gray-200 rounded-lg px-3 sm:px-4 py-2.5 max-[517px]:py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-green-900 uppercase tracking-wide mb-2" htmlFor="marketplace-max-price">
                  Max Budget (Cr)
                </label>
                <input
                  id="marketplace-max-price"
                  type="number"
                  min="0"
                  step="0.1"
                  value={filters.maxPrice}
                  onChange={handleFilterChange("maxPrice")}
                  placeholder="12"
                  className="w-full border border-gray-200 rounded-lg px-3 sm:px-4 py-2.5 max-[517px]:py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-green-900 uppercase tracking-wide mb-2" htmlFor="marketplace-bedrooms">
                  Bedrooms
                </label>
                <select
                  id="marketplace-bedrooms"
                  value={filters.bedrooms}
                  onChange={handleFilterChange("bedrooms")}
                  className="w-full border border-gray-200 rounded-lg px-3 sm:px-4 py-2.5 max-[517px]:py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
                >
                  {bedroomOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </form>

            <div className="flex flex-wrap items-center gap-2 max-[517px]:gap-1.5">
              {typeCatalog.map(({ type, count }) => {
                const isActive = filters.type === type
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => handleQuickType(type)}
                    className={`px-3 sm:px-4 max-[517px]:px-3 py-2 max-[517px]:py-1.5 text-xs sm:text-sm rounded-full border transition-colors ${
                      isActive ? "bg-green-600 border-green-600 text-white" : "border-green-200 text-green-700 hover:bg-green-50"
                    }`}
                  >
                    {titleCase(type)} • {count}
                  </button>
                )
              })}
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-sm text-gray-600 max-[517px]:gap-3">
              <div className="flex flex-wrap items-center gap-3">
                <span className="font-medium text-green-900">{resultsLabel}</span>
                {activeFilters > 0 && <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs">{activeFilters} active filters</span>}
              </div>
              <div className="flex items-center gap-3">
                <label className="text-xs font-semibold uppercase tracking-wide text-green-900" htmlFor="marketplace-sort">
                  Sort By
                </label>
                <select
                  id="marketplace-sort"
                  value={sortBy}
                  onChange={(event) => setSortBy(event.target.value)}
                  className="border border-gray-200 rounded-lg px-3 sm:px-4 py-2 max-[517px]:py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={resetFilters}
                  disabled={activeFilters === 0 && sortBy === "recommended"}
                  className={`text-sm font-medium border rounded-lg px-3 sm:px-4 py-2 max-[517px]:py-2 transition-colors ${
                    activeFilters === 0 && sortBy === "recommended"
                      ? "text-gray-400 border-gray-200 cursor-not-allowed"
                      : "text-green-700 border-green-200 hover:bg-green-50"
                  }`}
                >
                  Reset
                </button>
              </div>
            </div>
          </section>

          <section className="grid gap-6 max-[517px]:gap-4 lg:grid-cols-[minmax(0,1fr),320px]">
            <div className="space-y-6">
              {filteredProperties.length ? (
                <div className="grid gap-4 max-[517px]:gap-3 sm:gap-6 sm:grid-cols-2">
                  {filteredProperties.map((property) => (
                    <PropertyCard key={property.id} property={property} onView={handleViewProperty} />
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-2xl shadow-sm p-8 max-[517px]:p-5 text-center space-y-4">
                  <p className="text-2xl max-[517px]:text-xl font-semibold text-green-900">No matching properties yet</p>
                  <p className="text-gray-600 text-sm sm:text-base max-[517px]:text-[13px]">
                    Try broadening your filters or resetting them to explore all available listings across the marketplace.
                  </p>
                  <div className="flex justify-center">
                    <button
                      type="button"
                      onClick={resetFilters}
                      className="bg-green-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
                    >
                      Reset Filters
                    </button>
                  </div>
                </div>
              )}
            </div>

            <aside className="space-y-6">
              <div className="bg-white rounded-2xl shadow-sm p-6 max-[517px]:p-4 space-y-4">
                <h2 className="text-lg font-semibold text-green-900">Price Snapshot</h2>
                {priceStats ? (
                  <dl className="space-y-3 text-sm text-gray-600">
                    <div className="flex items-center justify-between">
                      <dt className="font-medium text-gray-700">Minimum</dt>
                      <dd>{formatPriceCr(priceStats.min)}</dd>
                    </div>
                    <div className="flex items-center justify-between">
                      <dt className="font-medium text-gray-700">Average</dt>
                      <dd>{formatPriceCr(priceStats.avg)}</dd>
                    </div>
                    <div className="flex items-center justify-between">
                      <dt className="font-medium text-gray-700">Maximum</dt>
                      <dd>{formatPriceCr(priceStats.max)}</dd>
                    </div>
                  </dl>
                ) : (
                  <p className="text-sm text-gray-500">Adjust filters to see live pricing insights for matching properties.</p>
                )}
              </div>

              <div className="bg-white rounded-2xl shadow-sm p-6 max-[517px]:p-4 space-y-4">
                <h2 className="text-lg font-semibold text-green-900">Property Mix</h2>
                {typeBreakdown.length ? (
                  <ul className="space-y-3 text-sm text-gray-600">
                    {typeBreakdown.map(({ type, count }) => (
                      <li key={type} className="flex items-center justify-between">
                        <span className="font-medium text-gray-700">{titleCase(type)}</span>
                        <span>{count} {count === 1 ? "listing" : "listings"}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500">No properties in view. Tweak your filters to see the current supply mix.</p>
                )}
              </div>
            </aside>
          </section>
        </div>
      </div>
    </div>
  )
}

export default MarketplacePage
