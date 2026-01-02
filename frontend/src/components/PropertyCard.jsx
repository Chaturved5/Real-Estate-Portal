import { Link } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

const formatPriceCr = (price) => `₹${(price / 10000000).toFixed(2)} Cr`

const PropertyCard = ({ property, onView }) => (
  <article className="theme-card rounded-xl sm:rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
    <img src={property.images[0]} alt={property.title} className="w-full h-40 sm:h-48 object-cover" />
    <div className="p-4 sm:p-6 space-y-3">
      <div>
        <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-1 line-clamp-2">{property.title}</h3>
        <p className="text-gray-500 text-xs sm:text-sm flex items-center">
          <span className="mr-1 sm:mr-2 text-green-700" aria-hidden="true">
            <FontAwesomeIcon icon="location-dot" />
          </span>
          {property.city} • {property.location}
        </p>
      </div>
      <div className="flex justify-between items-center text-sm sm:text-base text-gray-600">
        <span>{property.bedrooms > 0 ? `${property.bedrooms} BHK` : property.type.toUpperCase()}</span>
        <span>{property.area} sq.ft</span>
      </div>
      <p className="text-xl sm:text-2xl font-bold text-green-700">{formatPriceCr(property.price)}</p>
      <p className="text-gray-600 text-xs sm:text-sm line-clamp-2">{property.highlights[0]}</p>
      <div className="flex items-center justify-between text-xs sm:text-sm text-gray-500">
        <span className="flex items-center gap-1 text-amber-500 font-semibold">
          <FontAwesomeIcon icon="star" />
          <span className="text-gray-700">{property.rating.toFixed(1)}</span>
        </span>
        <span>{property.reviews.length} reviews</span>
      </div>
      <div className="grid grid-cols-2 gap-2 pt-2">
        <button
          type="button"
          onClick={() => onView(property.id)}
          className="bg-green-700 text-white py-2 rounded-lg text-xs sm:text-sm font-medium hover:bg-green-800 transition-colors"
        >
          View Details
        </button>
        <Link
          to={`/marketplace/${property.id}`}
          className="border border-green-700 text-green-700 py-2 rounded-lg text-xs sm:text-sm font-medium text-center hover:bg-green-50 transition-colors"
        >
          Quick Tour
        </Link>
      </div>
    </div>
  </article>
)

export default PropertyCard
