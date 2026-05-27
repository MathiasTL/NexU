import { jsx as _jsx } from "react/jsx-runtime";
import { cn } from '@/shared/utils/cn';
import { BOOKING_STATUS_LABELS, BOOKING_STATUS_COLORS } from '@/shared/utils/constants';
export const BookingStatusBadge = ({ status }) => (_jsx("span", { className: cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', BOOKING_STATUS_COLORS[status]), children: BOOKING_STATUS_LABELS[status] }));
