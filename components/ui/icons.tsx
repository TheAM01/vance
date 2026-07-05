/**
 * Central icon module. The app renders Heroicons (@heroicons/react); this file
 * maps them to friendly names and wraps each so it accepts a `size` prop
 * (width/height in px) in addition to `className`. Swap the icon set here once
 * and the whole app follows.
 */
import * as React from 'react'
import {
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  ChartBarIcon,
  BuildingOffice2Icon,
  CalendarIcon,
  CalendarDaysIcon,
  CheckIcon,
  CheckCircleIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ClockIcon,
  CurrencyDollarIcon,
  ArrowTopRightOnSquareIcon,
  FlagIcon,
  FolderIcon,
  HomeIcon,
  ChartPieIcon,
  CodeBracketIcon,
  ArrowPathIcon,
  Square3Stack3DIcon,
  Squares2X2Icon,
  QueueListIcon,
  ClipboardDocumentCheckIcon,
  ClipboardDocumentListIcon,
  ArrowRightStartOnRectangleIcon,
  Bars3Icon,
  MinusIcon,
  ComputerDesktopIcon,
  EllipsisVerticalIcon,
  SwatchIcon,
  PencilSquareIcon,
  PlusIcon,
  SignalIcon,
  Cog6ToothIcon,
  AdjustmentsHorizontalIcon,
  DocumentTextIcon,
  SunIcon,
  MoonIcon,
  ViewfinderCircleIcon,
  TrashIcon,
  ArrowTrendingUpIcon,
  UserIcon,
  WalletIcon,
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'

export type IconProps = React.SVGProps<SVGSVGElement> & {
  size?: number | string
  title?: string
}

function icon(Base: React.ComponentType<any>) {
  const Wrapped = React.forwardRef<SVGSVGElement, IconProps>(
    ({ size, width, height, ...props }, ref) => (
      <Base ref={ref} width={size ?? width} height={size ?? height} {...props} />
    )
  )
  Wrapped.displayName = 'Icon'
  return Wrapped
}

// lucide-style name → Heroicon
export const AlertCircle = icon(ExclamationCircleIcon)
export const AlertTriangle = icon(ExclamationTriangleIcon)
export const ArrowLeft = icon(ArrowLeftIcon)
export const ArrowRight = icon(ArrowRightIcon)
export const BarChart3 = icon(ChartBarIcon)
export const Building2 = icon(BuildingOffice2Icon)
export const Calendar = icon(CalendarIcon)
export const CalendarCheck = icon(CalendarDaysIcon)
export const CalendarClock = icon(CalendarDaysIcon)
export const CalendarDays = icon(CalendarDaysIcon)
export const CalendarRange = icon(CalendarDaysIcon)
export const Check = icon(CheckIcon)
export const CheckCircle2 = icon(CheckCircleIcon)
export const ChevronDown = icon(ChevronDownIcon)
export const ChevronLeft = icon(ChevronLeftIcon)
export const ChevronRight = icon(ChevronRightIcon)
export const Clock = icon(ClockIcon)
export const DollarSign = icon(CurrencyDollarIcon)
export const ExternalLink = icon(ArrowTopRightOnSquareIcon)
export const Flag = icon(FlagIcon)
export const FolderKanban = icon(FolderIcon)
export const Gauge = icon(ChartPieIcon)
export const Github = icon(CodeBracketIcon)
export const GitPullRequestArrow = icon(ArrowPathIcon)
export const Home = icon(HomeIcon)
export const Hourglass = icon(ClockIcon)
export const Layers = icon(Square3Stack3DIcon)
export const LayoutDashboard = icon(Squares2X2Icon)
export const LayoutList = icon(QueueListIcon)
export const ListChecks = icon(ClipboardDocumentCheckIcon)
export const ListTodo = icon(ClipboardDocumentListIcon)
export const Loader2 = icon(ArrowPathIcon)
export const LogOut = icon(ArrowRightStartOnRectangleIcon)
export const Menu = icon(Bars3Icon)
export const Minus = icon(MinusIcon)
export const Monitor = icon(ComputerDesktopIcon)
export const MoreVertical = icon(EllipsisVerticalIcon)
export const Palette = icon(SwatchIcon)
export const Pencil = icon(PencilSquareIcon)
export const Plus = icon(PlusIcon)
export const Radio = icon(SignalIcon)
export const Settings = icon(Cog6ToothIcon)
export const SlidersHorizontal = icon(AdjustmentsHorizontalIcon)
export const StickyNote = icon(DocumentTextIcon)
export const Sun = icon(SunIcon)
export const Moon = icon(MoonIcon)
export const Target = icon(ViewfinderCircleIcon)
export const Trash2 = icon(TrashIcon)
export const TrendingUp = icon(ArrowTrendingUpIcon)
export const User = icon(UserIcon)
export const Wallet = icon(WalletIcon)
export const PanelLeftClose = icon(ChevronDoubleLeftIcon)
export const PanelLeftOpen = icon(ChevronDoubleRightIcon)
export const X = icon(XMarkIcon)
