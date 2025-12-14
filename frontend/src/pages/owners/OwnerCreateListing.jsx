import { useMemo, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useMarketplace } from "../../context/MarketplaceContext.jsx"
import { useAuth } from "../../context/AuthContext.jsx"
import { useNotifications } from "../../context/NotificationContext.jsx"

const AMENITY_PRESETS = [
  "24x7 Security",
  "Power Backup",
  "Swimming Pool",
  "Clubhouse Access",
  "Smart Locks",
  "Dedicated Parking",
  "Pet Friendly",
  "EV Charging",
  "Gym & Wellness",
  "Housekeeping"
]

const PROPERTY_TYPES = [
  { value: "apartment", label: "Apartment" },
  { value: "villa", label: "Villa" },
  { value: "studio", label: "Studio" },
  { value: "penthouse", label: "Penthouse" },
  { value: "commercial", label: "Commercial" }
]

const STATUS_OPTIONS = [
  { value: "pending", label: "Pending Review" },
  { value: "available", label: "Available" },
  { value: "reserved", label: "Reserved" }
]

const numberOr = (value, fallback = 0) => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

const buildListFromText = (value) =>
  value
    .split(/\n|,/)
    .map((entry) => entry.trim())
    .filter(Boolean)

const defaultHero = "https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=1200&h=800&fit=crop"
const inputClasses = "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-600 bg-white"
const textareaClasses = `${inputClasses} min-h-[120px] resize-y`

const OwnerCreateListing = () => {
  const navigate = useNavigate()
  const { createProperty, agentsById } = useMarketplace()
  const { user } = useAuth()
  const { addNotification } = useNotifications()

  const [form, setForm] = useState({
    title: "",
    city: "",
    location: "",
    type: PROPERTY_TYPES[0].value,
    status: STATUS_OPTIONS[0].value,
    priceCr: "1.20",
    bedrooms: "3",
    bathrooms: "2",
    area: "1600",
    agentId: "",
    heroImage: defaultHero,
    gallery: "",
    highlights: "Sea-facing deck\nPrivate concierge",
    amenities: ["24x7 Security", "Power Backup"],
    description: ""
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [feedback, setFeedback] = useState(null)

  const agentOptions = useMemo(() => Array.from(agentsById.values()).sort((a, b) => a.name.localeCompare(b.name)), [agentsById])

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((previous) => ({ ...previous, [name]: value }))
  }

  const toggleAmenity = (amenity) => {
    setForm((previous) => ({
      ...previous,
      amenities: previous.amenities.includes(amenity)
        ? previous.amenities.filter((item) => item !== amenity)
        : [...previous.amenities, amenity]
    }))
  }

  const galleryImages = useMemo(() => {
    const entries = [form.heroImage, ...buildListFromText(form.gallery)]
    const unique = Array.from(new Set(entries.filter(Boolean)))
    return unique.length ? unique : [defaultHero]
  }, [form.heroImage, form.gallery])

  const highlightList = useMemo(() => {
    const built = buildListFromText(form.highlights)
    return built.length ? built : ["Add a selling point to make this stand out"]
  }, [form.highlights])

  const previewPrice = useMemo(() => numberOr(form.priceCr, 1) * 10000000, [form.priceCr])

  const formatPriceCr = (value) => `₹${(numberOr(value) / 10000000).toFixed(2)} Cr`

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!user?.id) {
      setFeedback({ tone: "error", message: "You need an owner session before publishing listings." })
      return
    }

    if (!form.title.trim() || !form.city.trim() || !form.location.trim()) {
      setFeedback({ tone: "error", message: "Please provide the listing title, city, and location." })
      return
    }

    setIsSubmitting(true)
    setFeedback(null)

    try {
      const payload = {
        title: form.title.trim(),
        city: form.city.trim(),
        location: form.location.trim(),
        type: form.type,
        status: form.status,
        price: Math.round(numberOr(form.priceCr, 1) * 10000000),
        bedrooms: numberOr(form.bedrooms, 0),
        bathrooms: numberOr(form.bathrooms, 1),
        area: numberOr(form.area, 0),
        amenities: form.amenities,
        highlights: highlightList,
        images: galleryImages,
        ownerId: user.id,
        agentId: form.agentId || null,
        description: form.description?.trim() ?? "",
        rating: 0,
        reviews: []
      }

      const created = await createProperty(payload)

      addNotification({
        role: "admin",
        title: "Listing pending review",
        message: `${user.name} submitted ${payload.title} for approval`,
        action: "/admin"
      })

      setFeedback({ tone: "success", message: `${payload.title} is saved. Redirecting you to the owner workspace...` })

      setTimeout(() => {
        navigate("/owners", { state: { highlightPropertyId: created?.id } })
      }, 1100)
    } catch (submitError) {
      setFeedback({ tone: "error", message: submitError.message || "Unable to create listing right now." })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-amber-50 py-10 sm:py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="page-panel p-6 sm:p-10 space-y-8">
          <header className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-green-700">Owner Workspace</p>
            <h1 className="text-3xl sm:text-4xl font-bold text-green-900">Create A New Listing</h1>
            <p className="text-sm sm:text-base text-gray-600 max-w-3xl">
              Fill in the property basics, upload a few hero images, and highlight the amenities buyers care about. The admin team will review and publish your listing.
            </p>
            <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
              <span className="px-3 py-1 bg-white border border-amber-100 rounded-full">Draft → Review → Live</span>
              <span className="px-3 py-1 bg-white border border-amber-100 rounded-full">Avg approval: &lt; 4 hrs</span>
            </div>
          </header>

          {feedback && (
            <div
              className={`rounded-xl px-4 py-3 text-sm ${
                feedback.tone === "success" ? "bg-green-50 text-green-800 border border-green-200" : "bg-amber-100 text-amber-900 border border-amber-200"
              }`}
            >
              {feedback.message}
            </div>
          )}

          <form className="space-y-8" onSubmit={handleSubmit}>
            <section className="bg-white rounded-2xl shadow-sm p-6 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold text-green-900">Property Basics</h2>
                  <p className="text-sm text-gray-500">Start with the fundamentals buyers filter for on the marketplace.</p>
                </div>
                <Link to="/owners" className="text-sm font-semibold text-green-700 hover:underline">
                  ← Back to dashboard
                </Link>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-1 text-sm font-medium text-green-900">
                  Listing title
                  <input
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    className={inputClasses}
                    placeholder="e.g., Premium Sky Villa with Terrace"
                    required
                  />
                </label>
                <label className="space-y-1 text-sm font-medium text-green-900">
                  City
                  <input
                    name="city"
                    value={form.city}
                    onChange={handleChange}
                    className={inputClasses}
                    placeholder="Mumbai"
                    required
                  />
                </label>
                <label className="space-y-1 text-sm font-medium text-green-900">
                  Neighborhood / Micro-market
                  <input
                    name="location"
                    value={form.location}
                    onChange={handleChange}
                    className={inputClasses}
                    placeholder="Bandra West"
                    required
                  />
                </label>
                <label className="space-y-1 text-sm font-medium text-green-900">
                  Property type
                  <select name="type" value={form.type} onChange={handleChange} className={inputClasses}>
                    {PROPERTY_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="space-y-1 text-sm font-medium text-green-900">
                  Listing status
                  <select name="status" value={form.status} onChange={handleChange} className={inputClasses}>
                    {STATUS_OPTIONS.map((status) => (
                      <option key={status.value} value={status.value}>
                        {status.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="space-y-1 text-sm font-medium text-green-900">
                  Partner broker (optional)
                  <select name="agentId" value={form.agentId} onChange={handleChange} className={inputClasses}>
                    <option value="">Assign later</option>
                    {agentOptions.map((agent) => (
                      <option key={agent.id} value={agent.id}>
                        {agent.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="space-y-1 text-sm font-medium text-green-900 md:col-span-2">
                  Short description
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    className={textareaClasses}
                    rows={3}
                    placeholder="Share what makes this listing unique..."
                  />
                </label>
              </div>
            </section>

            <section className="bg-white rounded-2xl shadow-sm p-6 space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-green-900">Financials & Specs</h2>
                <p className="text-sm text-gray-500">Translate everything to INR crore for a consistent marketplace experience.</p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-1 text-sm font-medium text-green-900">
                  Guide price (Cr)
                  <input
                    name="priceCr"
                    type="number"
                    min="0"
                    step="0.05"
                    value={form.priceCr}
                    onChange={handleChange}
                    className={inputClasses}
                    placeholder="1.20"
                    required
                  />
                </label>
                <label className="space-y-1 text-sm font-medium text-green-900">
                  Super built-up area (sq.ft)
                  <input
                    name="area"
                    type="number"
                    min="0"
                    value={form.area}
                    onChange={handleChange}
                    className={inputClasses}
                    placeholder="1500"
                  />
                </label>
                <label className="space-y-1 text-sm font-medium text-green-900">
                  Bedrooms
                  <input
                    name="bedrooms"
                    type="number"
                    min="0"
                    value={form.bedrooms}
                    onChange={handleChange}
                    className={inputClasses}
                  />
                </label>
                <label className="space-y-1 text-sm font-medium text-green-900">
                  Bathrooms
                  <input
                    name="bathrooms"
                    type="number"
                    min="1"
                    value={form.bathrooms}
                    onChange={handleChange}
                    className={inputClasses}
                  />
                </label>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="bg-amber-50 rounded-xl p-4 text-sm text-gray-700 space-y-1">
                  <p className="font-semibold text-green-900">Marketplace preview</p>
                  <p className="text-lg font-bold text-green-800">{form.title || "Untitled listing"}</p>
                  <p>{form.city || "City"} • {form.location || "Micro-market"}</p>
                  <p className="text-sm text-gray-500">{numberOr(form.bedrooms, 0) || "Studio"} • {numberOr(form.area, 0)} sq.ft</p>
                  <p className="text-xl font-semibold text-green-700">{formatPriceCr(previewPrice)}</p>
                  <p className="text-xs uppercase tracking-widest text-gray-500">{form.status}</p>
                </div>
                <div className="bg-amber-50 rounded-xl p-4 text-sm text-gray-700 space-y-1">
                  <p className="font-semibold text-green-900">Highlights preview</p>
                  <ul className="list-disc list-inside space-y-1">
                    {highlightList.map((highlight) => (
                      <li key={highlight}>{highlight}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>

            <section className="bg-white rounded-2xl shadow-sm p-6 space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-green-900">Amenities & Services</h2>
                <p className="text-sm text-gray-500">Toggle the facilities that are part of this asset.</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {AMENITY_PRESETS.map((amenity) => (
                  <button
                    type="button"
                    key={amenity}
                    onClick={() => toggleAmenity(amenity)}
                    className={`text-left px-4 py-3 rounded-xl border transition flex items-center justify-between ${
                      form.amenities.includes(amenity)
                        ? "border-green-600 bg-green-50 text-green-800"
                        : "border-gray-200 bg-gray-50 text-gray-600"
                    }`}
                  >
                    <span>{amenity}</span>
                    <span className="text-xs font-semibold uppercase tracking-wide">
                      {form.amenities.includes(amenity) ? "Added" : "Add"}
                    </span>
                  </button>
                ))}
              </div>
            </section>

            <section className="bg-white rounded-2xl shadow-sm p-6 space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-green-900">Media & Storytelling</h2>
                <p className="text-sm text-gray-500">A strong hero image and three punchy highlights improve conversions by 37%.</p>
              </div>

              <label className="space-y-1 text-sm font-medium text-green-900">
                Hero image URL
                <input
                  name="heroImage"
                  value={form.heroImage}
                  onChange={handleChange}
                  className={inputClasses}
                  placeholder={defaultHero}
                />
              </label>

              <label className="space-y-1 text-sm font-medium text-green-900">
                Additional gallery images (one per line)
                <textarea
                  name="gallery"
                  value={form.gallery}
                  onChange={handleChange}
                  className={textareaClasses}
                  rows={3}
                  placeholder="https://images.unsplash.com/..."
                />
              </label>

              <label className="space-y-1 text-sm font-medium text-green-900">
                Highlights (press enter for a new bullet)
                <textarea
                  name="highlights"
                  value={form.highlights}
                  onChange={handleChange}
                  className={textareaClasses}
                  rows={3}
                />
              </label>

              <div className="grid gap-4 sm:grid-cols-3">
                {galleryImages.slice(0, 3).map((image) => (
                  <img key={image} src={image} alt="Preview" className="h-32 w-full object-cover rounded-xl border border-amber-100" />
                ))}
              </div>
            </section>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <p className="text-xs text-gray-500">
                Submitting routes this listing to the admin command center for validation. You can continue editing it from the owner workspace.
              </p>
              <button
                type="submit"
                className="inline-flex items-center justify-center bg-green-700 text-white px-6 py-3 rounded-lg text-sm font-semibold hover:bg-green-800 transition-colors disabled:opacity-70"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Publishing..." : "Submit for Review"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default OwnerCreateListing
