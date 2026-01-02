import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import FileUploadField from '../../components/FileUploadField.jsx'
import { useMarketplace } from '../../context/MarketplaceContext.jsx'
import { useAuth } from '../../context/AuthContext.jsx'

const MAX_IMAGES = 10
const MAX_IMAGE_MB = 5

const STATUS_OPTIONS = ['draft', 'pending', 'approved', 'rejected', 'paused']
const PROPERTY_TYPES = ['apartment', 'villa', 'studio', 'penthouse', 'commercial']
const LISTING_INTENTS = ['rent', 'sale']

const inputClass = 'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-600 bg-white'
const textClass = `${inputClass} min-h-[120px] resize-y`

const toNumber = (value, fallback = 0) => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

const fileToDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })

const OwnerListingForm = ({ mode = 'create', initialData = null }) => {
  const navigate = useNavigate()
  const { createProperty, updateProperty } = useMarketplace()
  const { user } = useAuth()

  const [form, setForm] = useState(() => ({
    title: initialData?.title ?? '',
    listingIntent: initialData?.listingIntent ?? 'rent',
    propertyType: initialData?.type ?? 'apartment',
    status: initialData?.status ?? 'pending',
    city: initialData?.city ?? '',
    state: initialData?.state ?? '',
    pincode: initialData?.pincode ?? '',
    address: initialData?.address ?? initialData?.location ?? '',
    mapLink: initialData?.mapLink ?? '',
    bedrooms: String(initialData?.bedrooms ?? 2),
    bathrooms: String(initialData?.bathrooms ?? 2),
    area: String(initialData?.area ?? 1000),
    furnished: Boolean(initialData?.furnished ?? false),
    parking: Boolean(initialData?.parking ?? false),
    monthlyRent: String(initialData?.pricing?.monthlyRent ?? ''),
    deposit: String(initialData?.pricing?.deposit ?? ''),
    salePrice: String(initialData?.pricing?.salePrice ?? initialData?.price ?? ''),
    maintenance: String(initialData?.pricing?.maintenance ?? ''),
    coverImage: initialData?.images?.[0] ?? '',
    galleryText: initialData?.images?.slice(1)?.join('\n') ?? '',
    highlights: (initialData?.highlights ?? []).join('\n'),
    amenitiesText: (initialData?.amenities ?? []).join('\n')
  }))

  const [uploadedFiles, setUploadedFiles] = useState([])
  const [submitting, setSubmitting] = useState(false)
  const [feedback, setFeedback] = useState(null)

  const galleryUrls = useMemo(() => {
    return form.galleryText
      .split(/\n|,/)
      .map((entry) => entry.trim())
      .filter(Boolean)
  }, [form.galleryText])

  const highlightList = useMemo(() => {
    const entries = form.highlights
      .split(/\n|,/)
      .map((entry) => entry.trim())
      .filter(Boolean)
    return entries.length ? entries : ['Add a highlight to make this stand out']
  }, [form.highlights])

  const amenityList = useMemo(() => {
    return form.amenitiesText
      .split(/\n|,/)
      .map((entry) => entry.trim())
      .filter(Boolean)
  }, [form.amenitiesText])

  const priceLabel = form.listingIntent === 'rent' ? 'Monthly rent (₹)' : 'Sale price (₹)'
  const priceValue = form.listingIntent === 'rent' ? form.monthlyRent : form.salePrice

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  const dedupeImages = (list) => Array.from(new Set(list.filter(Boolean))).slice(0, MAX_IMAGES)

  const handleSubmit = async (nextStatus) => {
    if (!user?.id) {
      setFeedback({ tone: 'error', message: 'Owner session required.' })
      return
    }

    if (!form.title.trim() || !form.city.trim() || !form.address.trim()) {
      setFeedback({ tone: 'error', message: 'Please fill title, city, and address.' })
      return
    }

    setSubmitting(true)
    setFeedback(null)

    try {
      const fileImages = await Promise.all(uploadedFiles.map((file) => fileToDataUrl(file)))
      const images = dedupeImages([form.coverImage, ...galleryUrls, ...fileImages])

      const payload = {
        title: form.title.trim(),
        city: form.city.trim(),
        state: form.state.trim(),
        pincode: form.pincode.trim(),
        address: form.address.trim(),
        mapLink: form.mapLink.trim(),
        location: form.address.trim(),
        listingIntent: form.listingIntent,
        type: form.propertyType,
        status: nextStatus ?? form.status,
        bedrooms: toNumber(form.bedrooms, 0),
        bathrooms: toNumber(form.bathrooms, 1),
        area: toNumber(form.area, 0),
        furnished: Boolean(form.furnished),
        parking: Boolean(form.parking),
        pricing: {
          kind: form.listingIntent,
          monthlyRent: toNumber(form.monthlyRent, 0),
          deposit: toNumber(form.deposit, 0),
          salePrice: toNumber(form.salePrice, 0),
          maintenance: toNumber(form.maintenance, 0)
        },
        price: form.listingIntent === 'rent' ? toNumber(form.monthlyRent, 0) : toNumber(form.salePrice, 0),
        amenities: amenityList,
        highlights: highlightList,
        images,
        ownerId: user.id
      }

      if (mode === 'edit' && initialData?.id) {
        await updateProperty(initialData.id, payload)
        setFeedback({ tone: 'success', message: 'Listing updated.' })
      } else {
        await createProperty(payload)
        setFeedback({ tone: 'success', message: 'Listing saved.' })
      }

      setTimeout(() => navigate('/owner/listings'), 600)
    } catch (error) {
      setFeedback({ tone: 'error', message: error?.message || 'Something went wrong.' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="bg-amber-50 py-10 sm:py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="page-panel p-6 sm:p-10 space-y-8">
          <header className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-green-700">Owner Workspace</p>
            <h1 className="text-3xl sm:text-4xl font-bold text-green-900">{mode === 'edit' ? 'Edit Listing' : 'Create Listing'}</h1>
            <p className="text-sm sm:text-base text-gray-600 max-w-3xl">
              {mode === 'edit' ? 'Update listing details, pricing, or pause/resume visibility.' : 'Fill details, add media, and submit for approval. Images are limited to 10 files, 5 MB each.'}
            </p>
          </header>

          {feedback && (
            <div
              className={`rounded-xl px-4 py-3 text-sm ${
                feedback.tone === 'success'
                  ? 'bg-green-50 text-green-800 border border-green-200'
                  : 'bg-amber-100 text-amber-900 border border-amber-200'
              }`}
            >
              {feedback.message}
            </div>
          )}

          <div className="space-y-8">
            <section className="bg-white rounded-2xl shadow-sm p-6 space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-1 text-sm font-medium text-green-900">
                  Listing title
                  <input name="title" value={form.title} onChange={handleChange} className={inputClass} placeholder="Premium 3BHK near tech park" required />
                </label>
                <label className="space-y-1 text-sm font-medium text-green-900">
                  City
                  <input name="city" value={form.city} onChange={handleChange} className={inputClass} placeholder="Bangalore" required />
                </label>
                <label className="space-y-1 text-sm font-medium text-green-900">
                  State
                  <input name="state" value={form.state} onChange={handleChange} className={inputClass} placeholder="Karnataka" />
                </label>
                <label className="space-y-1 text-sm font-medium text-green-900">
                  Pincode
                  <input name="pincode" value={form.pincode} onChange={handleChange} className={inputClass} placeholder="560066" />
                </label>
                <label className="space-y-1 text-sm font-medium text-green-900 md:col-span-2">
                  Address / micro-market
                  <input name="address" value={form.address} onChange={handleChange} className={inputClass} placeholder="Outer Ring Road, Kadubeesanahalli" required />
                </label>
                <label className="space-y-1 text-sm font-medium text-green-900 md:col-span-2">
                  Map link (optional)
                  <input name="mapLink" value={form.mapLink} onChange={handleChange} className={inputClass} placeholder="https://maps.google.com/..." />
                </label>
              </div>
            </section>

            <section className="bg-white rounded-2xl shadow-sm p-6 space-y-6">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <label className="space-y-1 text-sm font-medium text-green-900">
                  Listing intent
                  <select name="listingIntent" value={form.listingIntent} onChange={handleChange} className={inputClass}>
                    {LISTING_INTENTS.map((intent) => (
                      <option key={intent} value={intent}>{intent === 'rent' ? 'Rent' : 'Sale'}</option>
                    ))}
                  </select>
                </label>
                <label className="space-y-1 text-sm font-medium text-green-900">
                  Property type
                  <select name="propertyType" value={form.propertyType} onChange={handleChange} className={inputClass}>
                    {PROPERTY_TYPES.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </label>
                <label className="space-y-1 text-sm font-medium text-green-900">
                  Status
                  <select name="status" value={form.status} onChange={handleChange} className={inputClass}>
                    {STATUS_OPTIONS.map((status) => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </label>
                <label className="space-y-1 text-sm font-medium text-green-900">
                  Bedrooms
                  <input name="bedrooms" type="number" min="0" value={form.bedrooms} onChange={handleChange} className={inputClass} />
                </label>
                <label className="space-y-1 text-sm font-medium text-green-900">
                  Bathrooms
                  <input name="bathrooms" type="number" min="1" value={form.bathrooms} onChange={handleChange} className={inputClass} />
                </label>
                <label className="space-y-1 text-sm font-medium text-green-900">
                  Area (sq.ft)
                  <input name="area" type="number" min="0" value={form.area} onChange={handleChange} className={inputClass} />
                </label>
                <label className="inline-flex items-center gap-2 text-sm font-medium text-green-900">
                  <input type="checkbox" name="furnished" checked={form.furnished} onChange={handleChange} /> Furnished
                </label>
                <label className="inline-flex items-center gap-2 text-sm font-medium text-green-900">
                  <input type="checkbox" name="parking" checked={form.parking} onChange={handleChange} /> Parking available
                </label>
              </div>
            </section>

            <section className="bg-white rounded-2xl shadow-sm p-6 space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-1 text-sm font-medium text-green-900">
                  {priceLabel}
                  <input name={form.listingIntent === 'rent' ? 'monthlyRent' : 'salePrice'} type="number" min="0" value={priceValue} onChange={handleChange} className={inputClass} required />
                </label>
                {form.listingIntent === 'rent' ? (
                  <label className="space-y-1 text-sm font-medium text-green-900">
                    Security deposit (₹)
                    <input name="deposit" type="number" min="0" value={form.deposit} onChange={handleChange} className={inputClass} />
                  </label>
                ) : (
                  <label className="space-y-1 text-sm font-medium text-green-900">
                    Maintenance / month (₹)
                    <input name="maintenance" type="number" min="0" value={form.maintenance} onChange={handleChange} className={inputClass} />
                  </label>
                )}
              </div>
            </section>

            <section className="bg-white rounded-2xl shadow-sm p-6 space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-1 text-sm font-medium text-green-900">
                  Highlights (one per line)
                  <textarea name="highlights" value={form.highlights} onChange={handleChange} className={textClass} rows={3} />
                </label>
                <label className="space-y-1 text-sm font-medium text-green-900">
                  Amenities (one per line)
                  <textarea name="amenitiesText" value={form.amenitiesText} onChange={handleChange} className={textClass} rows={3} />
                </label>
              </div>
            </section>

            <section className="bg-white rounded-2xl shadow-sm p-6 space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-1 text-sm font-medium text-green-900">
                  Cover image URL
                  <input name="coverImage" value={form.coverImage} onChange={handleChange} className={inputClass} placeholder="https://..." />
                </label>
                <label className="space-y-1 text-sm font-medium text-green-900">
                  Gallery image URLs (one per line)
                  <textarea name="galleryText" value={form.galleryText} onChange={handleChange} className={textClass} rows={3} placeholder="https://..." />
                </label>
              </div>
              <FileUploadField
                label="Upload images"
                hint="Supported: JPG/PNG. Max 10 images, 5 MB each."
                multiple
                files={uploadedFiles}
                onChange={setUploadedFiles}
                maxFiles={MAX_IMAGES}
                maxSizeMb={MAX_IMAGE_MB}
              />
              <div className="grid gap-3 sm:grid-cols-3">
                {dedupeImages([form.coverImage, ...galleryUrls]).slice(0, 3).map((src) => (
                  <div key={src} className="rounded-xl overflow-hidden border border-amber-100 bg-amber-50">
                    <img src={src} alt="Preview" className="h-32 w-full object-cover" />
                  </div>
                ))}
              </div>
            </section>

            <section className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
              <h3 className="text-sm font-semibold text-green-900 uppercase tracking-wide">Review</h3>
              <div className="text-sm text-gray-700 space-y-1">
                <p><span className="font-semibold">Intent:</span> {form.listingIntent}</p>
                <p><span className="font-semibold">Price:</span> {priceValue ? `₹${Number(priceValue).toLocaleString('en-IN')}` : '—'}</p>
                <p><span className="font-semibold">Status:</span> {form.status}</p>
                <p><span className="font-semibold">Images selected:</span> {dedupeImages([form.coverImage, ...galleryUrls]).length + uploadedFiles.length} / {MAX_IMAGES}</p>
              </div>
            </section>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <p className="text-xs text-gray-500">Draft saves locally; submit routes for admin approval.</p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => handleSubmit('draft')}
                  className="inline-flex items-center justify-center px-4 py-2 rounded-lg border border-amber-200 text-amber-800 text-sm font-semibold bg-white hover:bg-amber-50 disabled:opacity-60"
                >
                  Save draft
                </button>
                {mode === 'edit' ? (
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={() => handleSubmit(form.status || 'pending')}
                    className="inline-flex items-center justify-center px-5 py-2 rounded-lg bg-green-700 text-white text-sm font-semibold hover:bg-green-800 disabled:opacity-70"
                  >
                    Save changes
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={() => handleSubmit('pending')}
                    className="inline-flex items-center justify-center px-5 py-2 rounded-lg bg-green-700 text-white text-sm font-semibold hover:bg-green-800 disabled:opacity-70"
                  >
                    Submit for approval
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OwnerListingForm
