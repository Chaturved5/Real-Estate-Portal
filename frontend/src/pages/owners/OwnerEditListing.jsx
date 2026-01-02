import { useMemo } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useMarketplace } from '../../context/MarketplaceContext.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import OwnerListingForm from './OwnerListingForm.jsx'

const OwnerEditListing = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { properties } = useMarketplace()
  const { user } = useAuth()

  const listing = useMemo(() => properties.find((p) => String(p.id) === String(id)), [properties, id])

  if (!listing) {
    return (
      <div className="bg-amber-50 min-h-screen flex items-center justify-center px-4">
        <div className="bg-white border border-amber-100 rounded-xl p-6 space-y-3 text-center">
          <p className="text-sm text-gray-700">Listing not found.</p>
          <div className="flex gap-2 justify-center text-sm font-semibold">
            <button className="text-green-700" onClick={() => navigate(-1)}>Go back</button>
            <Link to="/owner/listings" className="text-green-700">All listings</Link>
          </div>
        </div>
      </div>
    )
  }

  if (user?.id && listing.ownerId && listing.ownerId !== user.id) {
    return (
      <div className="bg-amber-50 min-h-screen flex items-center justify-center px-4">
        <div className="bg-white border border-amber-100 rounded-xl p-6 space-y-3 text-center">
          <p className="text-sm text-gray-700">You do not have access to this listing.</p>
          <Link to="/owner/listings" className="text-green-700 text-sm font-semibold">Back to listings</Link>
        </div>
      </div>
    )
  }

  return <OwnerListingForm mode="edit" initialData={listing} />
}

export default OwnerEditListing
