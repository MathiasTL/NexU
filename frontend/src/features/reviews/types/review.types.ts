export interface Review {
  id: number
  propertyId: number
  bookingId: number
  reviewerId: number
  reviewerFirstName: string
  reviewerLastName: string
  reviewerAvatar: string
  rating: number
  comment: string
  createdAt: string
}
