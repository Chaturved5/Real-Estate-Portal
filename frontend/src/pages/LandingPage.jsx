import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import PropertyCard from "../components/PropertyCard";
import { useMarketplace } from "../context/MarketplaceContext.jsx";

const Toast = ({ message, onClose }) => {
  React.useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed bottom-4 right-4 left-4 sm:left-auto sm:bottom-8 sm:right-8 sm:max-w-sm bg-green-700 text-white px-4 py-3 sm:px-6 sm:py-4 rounded-lg shadow-lg z-50 animate-bounce text-sm sm:text-base">
      {message}
    </div>
  );
};

const FeatureCard = ({ icon, title, description }) => (
  <div className="theme-card rounded-xl sm:rounded-2xl p-6 sm:p-8 h-full hover:-translate-y-1 transition-transform duration-300">
    <div className="text-4xl sm:text-5xl mb-3 sm:mb-4 text-green-700" aria-hidden="true">
      {icon}
    </div>
    <h3 className="text-lg sm:text-xl font-semibold text-green-900 mb-2 sm:mb-3">
      {title}
    </h3>
    <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
      {description}
    </p>
  </div>
);

const StepCard = ({ number, title, description }) => (
  <div className="text-center step-card">
    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-green-600 text-white rounded-full flex items-center justify-center text-xl sm:text-2xl font-bold mb-3 sm:mb-4 mx-auto shadow-lg">
      {number}
    </div>
    <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">
      {title}
    </h3>
    <p className="text-xs sm:text-sm text-gray-600">{description}</p>
  </div>
);

const LandingPage = () => {
  const [searchLocation, setSearchLocation] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [toast, setToast] = useState(null);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [filteredProperties, setFilteredProperties] = useState([]);

  const navigate = useNavigate();
  const { properties, searchProperties } = useMarketplace();

  const quickStats = useMemo(
    () => [
      { label: "Verified Listings", value: "1.2K+" },
      { label: "Active Owners", value: "480+" },
      { label: "City Coverage", value: "34" },
      { label: "Avg. Rating", value: "4.8/5" },
    ],
    []
  );

  useEffect(() => {
    setFilteredProperties(properties.slice(0, 3));
  }, [properties]);

  const featuredProperties = useMemo(
    () => properties.slice(0, 3),
    [properties]
  );
  const resultsToRender = filteredProperties.length
    ? filteredProperties
    : featuredProperties;

  const handleSearch = (event) => {
    event.preventDefault();

    const results = searchProperties({
      city: searchLocation,
      type: propertyType,
      minPrice,
      maxPrice,
      bedrooms: "",
    });

    setFilteredProperties(results.slice(0, 3));
    setSearchPerformed(true);
    setToast(`Found ${results.length} properties matching your criteria`);
  };

  const handleViewProperty = (propertyId) => {
    setToast(`Opening details for property #${propertyId}`);
    navigate(`/property/${propertyId}`);
  };

  const handleListProperty = () => {
    setToast("Redirecting to owner signup...");
    navigate("/signup?role=owner");
  };

  return (
    <div className="bg-amber-50">
      <main>
        <section
          className="hero-section py-8 sm:py-12 md:py-16 lg:py-24"
          id="home"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid lg:grid-cols-2 gap-8 sm:gap-10 lg:gap-12 items-center">
              <div className="order-2 lg:order-1">
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-green-900 mb-4 sm:mb-6 leading-tight">
                  Find Your Dream Property
                </h1>
                <p className="text-base sm:text-lg md:text-xl text-gray-600 mb-6 sm:mb-8 leading-relaxed">
                  Connect directly with verified owners and brokers. Secure
                  bookings and transparent payments, all in one platform.
                </p>

                <form
                  className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg space-y-4"
                  onSubmit={handleSearch}
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-3 sm:mb-4">
                    <div>
                      <label
                        className="block text-xs sm:text-sm font-medium text-green-900 mb-1 sm:mb-2"
                        htmlFor="hero-location"
                      >
                        Location
                      </label>
                      <input
                        id="hero-location"
                        type="text"
                        value={searchLocation}
                        onChange={(event) =>
                          setSearchLocation(event.target.value)
                        }
                        placeholder="Enter city..."
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                    <div>
                      <label
                        className="block text-xs sm:text-sm font-medium text-green-900 mb-1 sm:mb-2"
                        htmlFor="hero-type"
                      >
                        Property Type
                      </label>
                      <select
                        id="hero-type"
                        value={propertyType}
                        onChange={(event) =>
                          setPropertyType(event.target.value)
                        }
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      >
                        <option value="">All Types</option>
                        <option value="apartment">Apartment</option>
                        <option value="villa">Villa</option>
                        <option value="studio">Studio</option>
                        <option value="penthouse">Penthouse</option>
                        <option value="commercial">Commercial</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
                    <div>
                      <label
                        className="block text-xs sm:text-sm font-medium text-green-900 mb-1 sm:mb-2"
                        htmlFor="hero-min-price"
                      >
                        Min Price (Cr)
                      </label>
                      <input
                        id="hero-min-price"
                        type="number"
                        value={minPrice}
                        onChange={(event) => setMinPrice(event.target.value)}
                        placeholder="2.5"
                        step="0.1"
                        min="0"
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                    <div>
                      <label
                        className="block text-xs sm:text-sm font-medium text-green-900 mb-1 sm:mb-2"
                        htmlFor="hero-max-price"
                      >
                        Max Price (Cr)
                      </label>
                      <input
                        id="hero-max-price"
                        type="number"
                        value={maxPrice}
                        onChange={(event) => setMaxPrice(event.target.value)}
                        placeholder="10"
                        step="0.1"
                        min="0"
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-green-600 text-white py-3 sm:py-4 rounded-lg text-base sm:text-lg font-semibold hover:bg-green-700 transition-colors duration-200 shadow-lg shadow-green-600/30 inline-flex items-center justify-center gap-2"
                  >
                    <FontAwesomeIcon icon="magnifying-glass" />
                    <span>Search Properties</span>
                  </button>
                </form>
                <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
                  {quickStats.map((stat) => (
                    <div key={stat.label} className="stat-pill">
                      <span className="text-xs uppercase tracking-wide text-gray-500">
                        {stat.label}
                      </span>
                      <span className="text-2xl font-bold text-green-900">
                        {stat.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="order-1 lg:order-2">
                <img
                  src="/assets/landing.jpg"
                  alt="Featured property showcase"
                  className="rounded-xl sm:rounded-2xl shadow-xl w-full h-48 sm:h-64 md:h-80 lg:h-auto object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="py-8 sm:py-12 md:py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-green-900 text-center mb-8 sm:mb-12">
              Why Choose EstatePortal
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              <FeatureCard
                icon={<FontAwesomeIcon icon="bolt" />}
                title="Quick Search"
                description="Find your ideal property with advanced filters for location, price, type, and amenities. Save time with smart search results."
              />
              <FeatureCard
                icon={<FontAwesomeIcon icon="shield-halved" />}
                title="Verified Owners & Brokers"
                description="Every property owner and broker is verified through our rigorous KYC process, ensuring trust and transparency."
              />
              <FeatureCard
                icon={<FontAwesomeIcon icon="credit-card" />}
                title="Secure Payments"
                description="Book properties with confidence using our integrated payment gateway. All transactions are secure and trackable."
              />
            </div>
          </div>
        </section>

        <section className="py-8 sm:py-12 md:py-16 bg-white-50/60">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              <div className="space-y-4">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-green-700">
                  Seamless Closings
                </p>
                <h3 className="text-2xl sm:text-3xl font-bold text-green-900">
                  Hand over the keys with confidence
                </h3>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                  From digital agreements to instant payment confirmation,
                  EstatePortal keeps every stakeholder in sync. Buyers gain
                  clarity, owners stay informed, and brokers capture every
                  commission trail in one shared workspace.
                </p>
                <ul className="space-y-3 text-sm sm:text-base text-gray-700">
                  <li className="flex items-start gap-3">
                    <span className="text-green-700" aria-hidden="true">
                      <FontAwesomeIcon icon="key" />
                    </span>
                    <span>
                      Role-aware workflows guide you from offer to handover
                      without missing a compliance step.
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-green-700" aria-hidden="true">
                      <FontAwesomeIcon icon="file-signature" />
                    </span>
                    <span>
                      Auto-generated checklists ensure documents, deposits, and
                      inspections are captured on time.
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-green-700" aria-hidden="true">
                      <FontAwesomeIcon icon="handshake" />
                    </span>
                    <span>
                      Smart notifications keep buyers, owners, and brokers
                      aligned so the final walkthrough feels effortless.
                    </span>
                  </li>
                </ul>
              </div>
              <div className="relative">
                <div
                  className="absolute inset-0 bg-gradient-to-br from-green-200/60 to-transparent blur-3xl -z-10"
                  aria-hidden="true"
                />
                <img
                  src="/assets/house-keys.jpg"
                  alt="Realtor handing over modern home keys"
                  className="rounded-2xl shadow-2xl border border-white/50 w-full object-cover"
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="py-8 sm:py-12 md:py-16 bg-amber-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-green-900 text-center mb-8 sm:mb-12">
              How It Works
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10 lg:gap-12">
              <StepCard
                number={1}
                title="Register"
                description="Create your account as a buyer, owner, or broker. Complete your profile with verified documents."
              />
              <StepCard
                number={2}
                title="List or Find"
                description="Owners list properties with details and photos. Buyers browse verified listings with transparent pricing."
              />
              <StepCard
                number={3}
                title="Book & Pay"
                description="Schedule viewings, make secure bookings, and complete payments through our integrated platform."
              />
            </div>
          </div>
        </section>

        <section className="py-8 sm:py-12 md:py-16 bg-white" id="browse">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 md:mb-12 gap-4 sm:gap-0">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-green-900">
                Featured Properties
              </h2>
              <Link
                to="/marketplace"
                className="text-sm sm:text-base text-green-600 hover:text-green-700 font-medium transition-colors inline-flex items-center gap-2"
              >
                <span>View All</span>
                <FontAwesomeIcon icon="arrow-right-long" />
              </Link>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
              {resultsToRender.map((property) => (
                <PropertyCard
                  key={property.id}
                  property={property}
                  onView={handleViewProperty}
                />
              ))}
            </div>
            {searchPerformed && filteredProperties.length === 0 && (
              <p className="text-center text-gray-600 py-8 sm:py-12 text-sm sm:text-base md:text-lg">
                No properties match your search criteria. Try adjusting your
                filters.
              </p>
            )}
          </div>
        </section>

        <section className="py-8 sm:py-12 md:py-16 bg-green-600" id="owners">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 sm:mb-4">
              Are You a Property Owner or Broker?
            </h2>
            <p className="text-white text-sm sm:text-base md:text-lg mb-6 sm:mb-8 max-w-2xl mx-auto px-4">
              List your properties on EstatePortal and connect with thousands of
              verified buyers. Manage bookings and payments seamlessly.
            </p>
            <button
              type="button"
              onClick={handleListProperty}
              className="bg-white text-green-900 px-6 sm:px-8 py-3 sm:py-4 rounded-lg text-base sm:text-lg font-semibold hover:bg-amber-50 transition-colors duration-200 shadow-lg inline-flex items-center gap-2 justify-center"
            >
              <FontAwesomeIcon icon="clipboard-list" />
              <span>List Your Property</span>
            </button>
          </div>
        </section>
      </main>

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  );
};

export default LandingPage;
