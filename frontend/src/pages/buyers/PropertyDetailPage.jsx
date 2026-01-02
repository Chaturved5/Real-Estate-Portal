import { useEffect, useMemo, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import PropertyCard from "../../components/PropertyCard"
import { useMarketplace } from "../../context/MarketplaceContext.jsx"
import { useNotifications } from "../../context/NotificationContext.jsx"

const BOOKING_STATUS_OPTIONS = ["pending", "confirmed", "cancelled"]
const PAYMENT_STATUS_OPTIONS = ["captured", "pending", "refunded"]
const PAYMENT_METHOD_OPTIONS = ["Razorpay", "Stripe", "Bank Transfer", "Cash"]

const toNumber = (value) => (typeof value === 'number' ? value : Number(value || 0))
const formatCurrency = (value) => `₹${toNumber(value).toLocaleString("en-IN")}`
const formatPriceCr = (value) => `₹${(toNumber(value) / 10000000).toFixed(2)} Cr`

const Modal = ({ title, children, onClose }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
    <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden">
      <div className="flex items-center justify-between border-b border-amber-100 px-6 py-4">
        <h3 className="text-lg font-semibold text-green-900">{title}</h3>
        <button
          type="button"
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close dialog"
        >
          <FontAwesomeIcon icon="xmark" />
        </button>
      </div>
      <div className="px-6 py-5">{children}</div>
    </div>
  </div>
)

const PropertyDetailPage = () => {
  const navigate = useNavigate()
  const { propertyId = "" } = useParams()
  const {
    properties,
    bookings,
    payments,
    agentsById,
    ownersById,
    loading,
    error,
    getPropertyById,
    addReview,
    addBooking,
    updateBooking,
    recordPayment,
    updatePayment
  } = useMarketplace()
  const { addNotification } = useNotifications()

  const property = getPropertyById(propertyId)
  const buyerId = user?.id || 'BUY-4001'

  const owner = property ? ownersById.get(property.ownerId) : null
  const agent = property ? agentsById.get(property.agentId) : null

  const relatedListings = useMemo(() => {
    if (!property) {
      return []
    }
    return properties
      .filter((candidate) => candidate.id !== property.id && (candidate.city === property.city || candidate.type === property.type))
      .slice(0, 3)
  }, [properties, property])

  const bookingDefaults = useMemo(() => {
    if (!property) {
      return { amount: "" }
    }
    return { amount: String(Math.round(property.price * 0.05)) }
  }, [property])

  const [bookingForm, setBookingForm] = useState({ startDate: "", endDate: "", amount: bookingDefaults.amount })
  const [collectDeposit, setCollectDeposit] = useState(true)
  const [bookingFeedback, setBookingFeedback] = useState("")
  const [showVisitModal, setShowVisitModal] = useState(false)
  const [visitForm, setVisitForm] = useState({ date: "", timeSlot: "10:00-10:30", note: "" })
  const [visitFeedback, setVisitFeedback] = useState("")
  const [reviewForm, setReviewForm] = useState({ name: "", rating: "5", comment: "" })
  const [reviewFeedback, setReviewFeedback] = useState("")
  const [managementFeedback, setManagementFeedback] = useState("")

  const [editingBooking, setEditingBooking] = useState(null)
  const [bookingEditForm, setBookingEditForm] = useState({ status: "pending", amount: "" })
  const [bookingModalError, setBookingModalError] = useState("")

  const [editingPayment, setEditingPayment] = useState(null)
  const [paymentEditForm, setPaymentEditForm] = useState({ status: "captured", method: "Razorpay" })
  const [paymentModalError, setPaymentModalError] = useState("")

  useEffect(() => {
    setBookingForm((previous) => ({ ...previous, amount: bookingDefaults.amount }))
  }, [bookingDefaults])

  useEffect(() => {
    if (editingBooking) {
      setBookingModalError("")
      setBookingEditForm({
        status: editingBooking.status,
        amount: String(editingBooking.amount)
      })
    }
  }, [editingBooking])

  useEffect(() => {
    if (editingPayment) {
      setPaymentModalError("")
      setPaymentEditForm({
        status: editingPayment.status,
        method: editingPayment.method ?? PAYMENT_METHOD_OPTIONS[0]
      })
    }
  }, [editingPayment])

  const propertyBookings = useMemo(
    () => bookings.filter((booking) => booking.propertyId === propertyId),
    [bookings, propertyId]
  )

  const sortedBookings = useMemo(
    () => [...propertyBookings].sort((a, b) => (b.startDate || "").localeCompare(a.startDate || "")),
    [propertyBookings]
  )

  const propertyPayments = useMemo(
    () => payments.filter((payment) => propertyBookings.some((booking) => booking.id === payment.bookingId)),
    [payments, propertyBookings]
  )

  const sortedPayments = useMemo(
    () => [...propertyPayments].sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || "")),
    [propertyPayments]
  )

  if (!property) {
    return (
      <div className="bg-amber-50 py-12 sm:py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center space-y-4">
          <h1 className="text-3xl sm:text-4xl font-bold text-green-900">Listing not found</h1>
          <p className="text-gray-600 text-sm sm:text-base">
            The property you are looking for might have been removed or is no longer available.
          </p>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center justify-center bg-green-700 text-white px-5 py-3 rounded-lg text-sm font-semibold hover:bg-green-800 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  const totalRevenue = propertyPayments.reduce((sum, payment) => sum + toNumber(payment.amount), 0)

  const handleBookingSubmit = async (event) => {
    event.preventDefault()
    setBookingFeedback("")

    if (!bookingForm.startDate || !bookingForm.endDate || !bookingForm.amount) {
      setBookingFeedback("Please fill in check-in, check-out, and deposit details.")
      return
    }

    const depositValue = Number(bookingForm.amount)
    if (Number.isNaN(depositValue) || depositValue <= 0) {
      setBookingFeedback("Deposit amount must be a positive number.")
      return
    }

    try {
      const bookingPayload = {
        propertyId: property.id,
        userId: buyerId,
        bookingType: 'rental',
        status: collectDeposit ? "confirmed" : "pending",
        startDate: bookingForm.startDate,
        endDate: bookingForm.endDate,
        amount: depositValue,
        paymentId: null
      }

      const createdBooking = await addBooking(bookingPayload)
      let feedbackMessage = "Booking recorded successfully. We'll notify the owner instantly."

      if (collectDeposit && createdBooking?.id) {
        const paymentPayload = {
          bookingId: createdBooking.id,
          amount: depositValue,
          method: "Razorpay",
          status: "captured",
          createdAt: new Date().toISOString().slice(0, 10)
        }
        const createdPayment = await recordPayment(paymentPayload)
        if (createdPayment?.id) {
          await updateBooking(createdBooking.id, { paymentId: createdPayment.id, status: "confirmed" })
        }
        feedbackMessage = "Booking and deposit captured successfully."
        setManagementFeedback("Deposit captured for the latest booking.")
        addNotification({
          role: "owner",
          title: "New booking deposit",
          message: `${property.title} just secured a deposit of ${formatCurrency(depositValue)}.`,
          action: "/owners"
        })
        addNotification({
          role: "admin",
          title: "Booking confirmed",
          message: `Booking ${createdBooking.id} is confirmed with payment captured.`,
          action: "/admin"
        })
      }

      setBookingFeedback(feedbackMessage)
      setBookingForm({ startDate: "", endDate: "", amount: bookingDefaults.amount })
    } catch (submitError) {
      setBookingFeedback(submitError.message || "Unable to record booking right now. Please try again.")
    }
  }

  const handleVisitSubmit = async (event) => {
    event.preventDefault()
    setVisitFeedback("")

    if (!canTransact) {
      setVisitFeedback(transactionMessage || "Please log in with a verified profile to book.")
      return
    }

    if (!visitForm.date || !visitForm.timeSlot) {
      setVisitFeedback("Please select a date and time slot.")
      return
    }

    try {
      await addBooking({
        propertyId: property.id,
        userId: buyerId,
        bookingType: 'visit',
        status: 'pending',
        startDate: visitForm.date,
        endDate: visitForm.date,
        timeSlot: visitForm.timeSlot,
        amount: 0,
        paymentId: null,
        notes: visitForm.note?.trim() || ''
      })
      setVisitFeedback("Visit request sent. The owner/agent will confirm the slot.")
      setVisitForm({ date: "", timeSlot: "10:00-10:30", note: "" })
      setShowVisitModal(false)
    } catch (visitError) {
      setVisitFeedback(visitError.message || "Unable to schedule visit right now.")
    }
  }

  const handleReviewSubmit = async (event) => {
    event.preventDefault()
    setReviewFeedback("")

    const ratingValue = Number(reviewForm.rating)
    if (!reviewForm.name.trim() || !reviewForm.comment.trim()) {
      setReviewFeedback("Please share your name and comments before submitting.")
      return
    }
    if (Number.isNaN(ratingValue) || ratingValue < 1 || ratingValue > 5) {
      setReviewFeedback("Rating must be between 1 and 5.")
      return
    }

    try {
      await addReview(property.id, {
        userId: `GUEST-${Date.now()}`,
        userName: reviewForm.name.trim(),
        rating: ratingValue,
        comment: reviewForm.comment.trim()
      })
      addNotification({
        role: "owner",
        title: "New guest review",
        message: `${reviewForm.name.trim()} rated ${property.title} ${ratingValue}★.`,
        action: "/owners"
      })
      addNotification({
        role: "admin",
        title: "Review published",
        message: `A new ${ratingValue}★ review was posted for ${property.title}.`,
        action: "/admin"
      })
      setReviewFeedback("Thank you! Your review is now live.")
      setReviewForm({ name: "", rating: "5", comment: "" })
    } catch (reviewError) {
      setReviewFeedback(reviewError.message || "Unable to submit review right now.")
    }
  }

  const handleBookingEditSubmit = async (event) => {
    event.preventDefault()
    if (!editingBooking) {
      return
    }

    const amountValue = Number(bookingEditForm.amount)
    if (Number.isNaN(amountValue) || amountValue <= 0) {
      setBookingModalError("Deposit amount must be a positive number.")
      return
    }

    try {
      await updateBooking(editingBooking.id, {
        status: bookingEditForm.status,
        amount: amountValue
      })
      setManagementFeedback("Booking updated successfully.")
      setEditingBooking(null)
    } catch (updateError) {
      setBookingModalError(updateError.message || "Failed to update booking. Please try again.")
    }
  }

  const handlePaymentEditSubmit = async (event) => {
    event.preventDefault()
    if (!editingPayment) {
      return
    }

    try {
      await updatePayment(editingPayment.id, {
        status: paymentEditForm.status,
        method: paymentEditForm.method
      })
      setManagementFeedback("Payment updated successfully.")
      setEditingPayment(null)
    } catch (updateError) {
      setPaymentModalError(updateError.message || "Failed to update payment. Please try again.")
    }
  }

  return (
    <div className="bg-amber-50 py-10 sm:py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <nav className="text-sm text-green-700 flex flex-wrap items-center gap-2">
          <Link to="/" className="hover:underline">Home</Link>
          <span aria-hidden="true">/</span>
          <Link to="/marketplace" className="hover:underline">Marketplace</Link>
          <span aria-hidden="true">/</span>
          <span className="font-medium text-green-900">{property.title}</span>
        </nav>

        {loading && (
          <div className="bg-white border border-amber-100 rounded-xl px-4 py-3 text-sm text-gray-600">
            Fetching the latest data from the server...
          </div>
        )}

        {error && (
          <div className="bg-amber-100 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-900">
            {error}
          </div>
        )}

        <header className="space-y-6">
          <div className="grid lg:grid-cols-[2fr,1fr] gap-6">
            <div className="space-y-4">
              <img
                src={property.images[0]}
                alt={property.title}
                className="w-full h-72 sm:h-96 object-cover rounded-2xl shadow-lg"
              />
              <div className="grid grid-cols-3 gap-3">
                {property.images.slice(1).map((image, index) => (
                  <img key={image} src={image} alt={`${property.title} ${index + 2}`} className="h-28 sm:h-32 w-full object-cover rounded-xl" />
                ))}
              </div>
            </div>
            <aside className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
              <div>
                <h1 className="text-3xl font-bold text-green-900 mb-1">{property.title}</h1>
                <p className="text-sm text-gray-500">{property.city} • {property.location}</p>
              </div>
              <p className="text-2xl font-semibold text-green-700">{formatPriceCr(property.price)}</p>
              <div className="grid grid-cols-2 gap-3 text-sm text-gray-600">
                <div>
                  <p className="font-semibold text-gray-800">Bedrooms</p>
                  <p>{property.bedrooms || "Studio"}</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-800">Bathrooms</p>
                  <p>{property.bathrooms}</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-800">Area</p>
                  <p>{property.area} sq.ft</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-800">Status</p>
                  <p className="capitalize">{property.status}</p>
                </div>
              </div>
              <div className="bg-amber-100 rounded-xl p-4 text-sm text-gray-700">
                <p className="font-semibold text-green-900">Highlights</p>
                <ul className="list-disc list-inside space-y-1 mt-2">
                  {property.highlights.map((highlight) => (
                    <li key={highlight}>{highlight}</li>
                  ))}
                </ul>
              </div>
              <div className="flex flex-col gap-2 text-sm text-gray-700">
                <p className="font-semibold text-green-900">Listed by</p>
                <p>{owner?.name ?? "Owner"}</p>
                <p className="font-semibold text-green-900">Agent support</p>
                <p>{agent ? `${agent.name} • ${agent.phone}` : "N/A"}</p>
              </div>
            </aside>
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr),360px]">
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
              <h2 className="text-xl font-semibold text-green-900">Amenities</h2>
              <ul className="grid sm:grid-cols-2 gap-3 text-sm text-gray-600">
                {property.amenities.map((amenity) => (
                  <li key={amenity} className="flex items-center gap-2">
                    <span aria-hidden="true">✔️</span>
                    <span>{amenity}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <h2 className="text-xl font-semibold text-green-900">Guest Reviews</h2>
                <span className="text-sm text-gray-500">Overall rating: ⭐ {property.rating.toFixed(1)}</span>
              </div>
              {property.reviews.length ? (
                <ul className="space-y-4 text-sm text-gray-700">
                  {property.reviews.map((review) => (
                    <li key={review.id} className="border border-amber-100 rounded-xl p-4 space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-green-900">{review.userName}</p>
                        <span className="text-xs text-gray-500">{review.createdAt}</span>
                      </div>
                      <p>⭐ {review.rating.toFixed(1)}</p>
                      <p className="text-gray-600">{review.comment}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500">Be the first to leave a review for this property.</p>
              )}

              <form className="space-y-3 bg-amber-50 rounded-xl p-4" onSubmit={handleReviewSubmit}>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wide text-green-900 mb-1" htmlFor="review-name">
                      Your Name
                    </label>
                    <input
                      id="review-name"
                      type="text"
                      value={reviewForm.name}
                      onChange={(event) => setReviewForm((previous) => ({ ...previous, name: event.target.value }))}
                      placeholder="Enter your name"
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wide text-green-900 mb-1" htmlFor="review-rating">
                      Rating
                    </label>
                    <select
                      id="review-rating"
                      value={reviewForm.rating}
                      onChange={(event) => setReviewForm((previous) => ({ ...previous, rating: event.target.value }))}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
                    >
                      {[5, 4, 3, 2, 1].map((value) => (
                        <option key={value} value={value}>
                          {value} Stars
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wide text-green-900 mb-1" htmlFor="review-comment">
                    Comments
                  </label>
                  <textarea
                    id="review-comment"
                    value={reviewForm.comment}
                    onChange={(event) => setReviewForm((previous) => ({ ...previous, comment: event.target.value }))}
                    rows={4}
                    placeholder="Share your stay experience..."
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
                  />
                </div>
                {reviewFeedback && <p className="text-sm text-green-700">{reviewFeedback}</p>}
                <button
                  type="submit"
                  className="inline-flex items-center justify-center bg-green-700 text-white px-5 py-3 rounded-lg text-sm font-semibold hover:bg-green-800 transition-colors"
                >
                  Submit Review
                </button>
              </form>
            </div>
          </div>

          <aside className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
              <h2 className="text-lg font-semibold text-green-900">Booking Options</h2>
              <p className="text-sm text-gray-600">
                Schedule a visit or request a rental booking. Deposits are captured securely once approved.
              </p>
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  type="button"
                  onClick={() => setShowVisitModal(true)}
                  className="w-full sm:w-auto inline-flex items-center justify-center border border-green-200 text-green-800 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-50"
                >
                  Schedule visit
                </button>
                <button
                  type="button"
                  onClick={() => setCollectDeposit(true)}
                  className="w-full sm:w-auto inline-flex items-center justify-center bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-800"
                >
                  Request rental booking
                </button>
              </div>

              <form className="space-y-3" onSubmit={handleBookingSubmit}>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wide text-green-900 mb-1" htmlFor="booking-start">
                    Check-in
                  </label>
                  <input
                    id="booking-start"
                    type="date"
                    value={bookingForm.startDate}
                    onChange={(event) => setBookingForm((previous) => ({ ...previous, startDate: event.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wide text-green-900 mb-1" htmlFor="booking-end">
                    Check-out
                  </label>
                  <input
                    id="booking-end"
                    type="date"
                    value={bookingForm.endDate}
                    onChange={(event) => setBookingForm((previous) => ({ ...previous, endDate: event.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wide text-green-900 mb-1" htmlFor="booking-amount">
                    Deposit Amount (₹)
                  </label>
                  <input
                    id="booking-amount"
                    type="number"
                    min="0"
                    step="1000"
                    value={bookingForm.amount}
                    onChange={(event) => setBookingForm((previous) => ({ ...previous, amount: event.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
                  />
                </div>
                <label className="flex items-center gap-3 text-sm text-gray-600">
                  <input
                    type="checkbox"
                    checked={collectDeposit}
                    onChange={(event) => setCollectDeposit(event.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-green-700 focus:ring-green-600"
                  />
                  Capture deposit instantly (Razorpay)
                </label>
                {bookingFeedback && <p className="text-sm text-green-700">{bookingFeedback}</p>}
                <button
                  type="submit"
                  className="w-full bg-green-700 text-white px-4 py-3 rounded-lg text-sm font-semibold hover:bg-green-800 transition-colors"
                >
                  Reserve Visit Slot
                </button>
              </form>
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-6 space-y-3">
              <h2 className="text-lg font-semibold text-green-900">Performance Snapshot</h2>
              <dl className="space-y-3 text-sm text-gray-700">
                <div className="flex items-center justify-between">
                  <dt className="font-medium text-gray-800">Bookings recorded</dt>
                  <dd>{propertyBookings.length}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="font-medium text-gray-800">Revenue captured</dt>
                  <dd>{formatCurrency(totalRevenue)}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="font-medium text-gray-800">Average stay rating</dt>
                  <dd>⭐ {property.rating.toFixed(1)}</dd>
                </div>
              </dl>
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <h2 className="text-lg font-semibold text-green-900">Manage Transactions</h2>
                <button
                  type="button"
                  onClick={() => setManagementFeedback("")}
                  className="text-xs text-green-700 hover:underline"
                >
                  Clear status
                </button>
              </div>
              {managementFeedback && <p className="text-xs text-green-700">{managementFeedback}</p>}

              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-green-800">Bookings</p>
                {sortedBookings.length ? (
                  <ul className="space-y-3 text-sm text-gray-700">
                    {sortedBookings.map((booking) => (
                      <li key={booking.id} className="border border-amber-100 rounded-xl p-4 flex flex-col gap-2">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-[11px] font-semibold uppercase tracking-wide text-amber-800">
                              {booking.bookingType === 'visit' ? 'Visit' : 'Rental'}
                            </span>
                            <p className="font-semibold text-green-900">Booking #{booking.id}</p>
                          </div>
                          <span className="text-xs font-semibold uppercase tracking-wide text-green-700">{booking.status}</span>
                        </div>
                        <p className="text-xs text-gray-500">
                          {booking.bookingType === 'visit'
                            ? `${booking.startDate || booking.endDate} • ${booking.timeSlot || 'Slot TBC'}`
                            : `${booking.startDate} → ${booking.endDate}`}
                        </p>
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                          <p className="text-sm text-gray-600">Deposit: {formatCurrency(booking.amount)}</p>
                          <button
                            type="button"
                            onClick={() => setEditingBooking(booking)}
                            className="self-start sm:self-auto text-xs font-semibold text-green-700 border border-green-200 rounded-lg px-3 py-1.5 hover:bg-green-50 transition-colors"
                          >
                            Edit booking
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-gray-500">No bookings recorded yet.</p>
                )}
              </div>

              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-green-800">Payments</p>
                {sortedPayments.length ? (
                  <ul className="space-y-3 text-sm text-gray-700">
                    {sortedPayments.map((payment) => (
                      <li key={payment.id} className="border border-amber-100 rounded-xl p-4 flex flex-col gap-2">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                          <div>
                            <p className="font-semibold text-green-900">Payment #{payment.id}</p>
                            <p className="text-xs text-gray-500">{payment.createdAt}</p>
                          </div>
                          <span className="text-xs font-semibold uppercase tracking-wide text-green-700">{payment.status}</span>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                          <p className="text-sm text-gray-600">{formatCurrency(payment.amount)} • {payment.method}</p>
                          <button
                            type="button"
                            onClick={() => setEditingPayment(payment)}
                            className="self-start sm:self-auto text-xs font-semibold text-green-700 border border-green-200 rounded-lg px-3 py-1.5 hover:bg-green-50 transition-colors"
                          >
                            Edit payment
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-gray-500">No payments captured for this listing yet.</p>
                )}
              </div>
            </div>
          </aside>
        </section>

        {relatedListings.length > 0 && (
          <section className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <h2 className="text-xl font-semibold text-green-900">You may also like</h2>
              <Link to="/marketplace" className="text-sm text-green-700 hover:underline">
                View all listings
              </Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {relatedListings.map((listing) => (
                <PropertyCard key={listing.id} property={listing} onView={(id) => navigate(`/marketplace/${id}`)} />
              ))}
            </div>
          </section>
        )}
      </div>

      {showVisitModal && (
        <Modal title="Schedule a visit" onClose={() => setShowVisitModal(false)}>
          <form className="space-y-4" onSubmit={handleVisitSubmit}>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-green-900 mb-1" htmlFor="visit-date">
                  Visit date
                </label>
                <input
                  id="visit-date"
                  type="date"
                  value={visitForm.date}
                  onChange={(event) => setVisitForm((prev) => ({ ...prev, date: event.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-green-900 mb-1" htmlFor="visit-slot">
                  Time slot
                </label>
                <select
                  id="visit-slot"
                  value={visitForm.timeSlot}
                  onChange={(event) => setVisitForm((prev) => ({ ...prev, timeSlot: event.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
                >
                  {['10:00-10:30', '12:00-12:30', '15:00-15:30', '18:00-18:30'].map((slot) => (
                    <option key={slot} value={slot}>{slot}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-green-900 mb-1" htmlFor="visit-note">
                Note for owner/agent (optional)
              </label>
              <textarea
                id="visit-note"
                value={visitForm.note}
                onChange={(event) => setVisitForm((prev) => ({ ...prev, note: event.target.value }))}
                rows={3}
                placeholder="Share preferred access instructions or questions"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
              />
            </div>
            {visitFeedback && <p className="text-sm text-green-700">{visitFeedback}</p>}
            <div className="flex items-center justify-end gap-3">
              <button type="button" onClick={() => setShowVisitModal(false)} className="text-sm text-gray-500 hover:text-gray-700">
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex items-center justify-center bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-800 transition-colors"
              >
                Send request
              </button>
            </div>
          </form>
        </Modal>
      )}

      {editingBooking && (
        <Modal title={`Edit booking #${editingBooking.id}`} onClose={() => setEditingBooking(null)}>
          <form className="space-y-4" onSubmit={handleBookingEditSubmit}>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-green-900 mb-1" htmlFor="edit-booking-status">
                Status
              </label>
              <select
                id="edit-booking-status"
                value={bookingEditForm.status}
                onChange={(event) => setBookingEditForm((previous) => ({ ...previous, status: event.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
              >
                {BOOKING_STATUS_OPTIONS.map((status) => (
                  <option key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-green-900 mb-1" htmlFor="edit-booking-amount">
                Deposit Amount (₹)
              </label>
              <input
                id="edit-booking-amount"
                type="number"
                min="0"
                step="1000"
                value={bookingEditForm.amount}
                onChange={(event) => setBookingEditForm((previous) => ({ ...previous, amount: event.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
              />
            </div>
            {bookingModalError && <p className="text-sm text-amber-700">{bookingModalError}</p>}
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setEditingBooking(null)}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex items-center justify-center bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-800 transition-colors"
              >
                Save changes
              </button>
            </div>
          </form>
        </Modal>
      )}

      {editingPayment && (
        <Modal title={`Edit payment #${editingPayment.id}`} onClose={() => setEditingPayment(null)}>
          <form className="space-y-4" onSubmit={handlePaymentEditSubmit}>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-green-900 mb-1" htmlFor="edit-payment-status">
                Status
              </label>
              <select
                id="edit-payment-status"
                value={paymentEditForm.status}
                onChange={(event) => setPaymentEditForm((previous) => ({ ...previous, status: event.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
              >
                {PAYMENT_STATUS_OPTIONS.map((status) => (
                  <option key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-green-900 mb-1" htmlFor="edit-payment-method">
                Payment Method
              </label>
              <select
                id="edit-payment-method"
                value={paymentEditForm.method}
                onChange={(event) => setPaymentEditForm((previous) => ({ ...previous, method: event.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
              >
                {PAYMENT_METHOD_OPTIONS.map((method) => (
                  <option key={method} value={method}>
                    {method}
                  </option>
                ))}
              </select>
            </div>
            {paymentModalError && <p className="text-sm text-amber-700">{paymentModalError}</p>}
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setEditingPayment(null)}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex items-center justify-center bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-800 transition-colors"
              >
                Save changes
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}

export default PropertyDetailPage
