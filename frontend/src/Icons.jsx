/**
 * Icons.jsx — Tập trung toàn bộ icon dùng Font Awesome 6 Free
 * Cú pháp: <IconName size={20} color="red" className="..." style={{...}} />
 * Tương thích hoàn toàn với cách dùng lucide-react cũ.
 */

import React from 'react';

/**
 * Hàm helper tạo ra một icon component từ class FA
 */
function mkIcon(faClass) {
  return function FaIcon({ size = 16, color, className = '', style = {}, fill, ...rest }) {
    return (
      <i
        className={`${faClass} ${className}`}
        style={{
          fontSize: size,
          color: color || (fill && fill !== 'none' ? fill : undefined),
          lineHeight: 1,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          ...style,
        }}
        {...rest}
      />
    );
  };
}

// ─── Navigation & UI ─────────────────────────────────────────
export const Home          = mkIcon('fa-solid fa-house');
export const Search        = mkIcon('fa-solid fa-magnifying-glass');
export const ChevronDown   = mkIcon('fa-solid fa-chevron-down');
export const ChevronRight  = mkIcon('fa-solid fa-chevron-right');
export const ChevronLeft   = mkIcon('fa-solid fa-chevron-left');
export const ArrowLeft     = mkIcon('fa-solid fa-arrow-left');
export const ArrowRight    = mkIcon('fa-solid fa-arrow-right');
export const X             = mkIcon('fa-solid fa-xmark');
export const Menu          = mkIcon('fa-solid fa-bars');
export const Bell          = mkIcon('fa-solid fa-bell');
export const Settings      = mkIcon('fa-solid fa-gear');
export const RefreshCw     = mkIcon('fa-solid fa-rotate');
export const Eye           = mkIcon('fa-solid fa-eye');
export const EyeOff        = mkIcon('fa-solid fa-eye-slash');
export const MoreVertical  = mkIcon('fa-solid fa-ellipsis-vertical');

// ─── Auth & User ─────────────────────────────────────────────
export const User          = mkIcon('fa-solid fa-user');
export const Users         = mkIcon('fa-solid fa-users');
export const LogIn         = mkIcon('fa-solid fa-right-to-bracket');
export const LogOut        = mkIcon('fa-solid fa-right-from-bracket');
export const Key           = mkIcon('fa-solid fa-key');
export const Lock          = mkIcon('fa-solid fa-lock');
export const Unlock        = mkIcon('fa-solid fa-lock-open');
export const Shield        = mkIcon('fa-solid fa-shield');
export const ShieldCheck   = mkIcon('fa-solid fa-shield-halved');

// ─── Commerce ────────────────────────────────────────────────
export const ShoppingCart  = mkIcon('fa-solid fa-cart-shopping');
export const ShoppingBag   = mkIcon('fa-solid fa-bag-shopping');
export const Tag           = mkIcon('fa-solid fa-tag');
export const Package       = mkIcon('fa-solid fa-box');
export const Trash2        = mkIcon('fa-solid fa-trash-can');
export const Plus          = mkIcon('fa-solid fa-plus');
export const Minus         = mkIcon('fa-solid fa-minus');
export const ClipboardList = mkIcon('fa-solid fa-clipboard-list');
export const Receipt       = mkIcon('fa-solid fa-receipt');
export const CreditCard    = mkIcon('fa-solid fa-credit-card');
export const Wallet        = mkIcon('fa-solid fa-wallet');
export const Percent       = mkIcon('fa-solid fa-percent');

// ─── Rating & Feedback ───────────────────────────────────────
export const Star = ({ size = 16, color, className = '', style = {}, fill, ...rest }) => {
  const isFilled = fill !== 'none';
  const faClass = isFilled ? 'fa-solid fa-star' : 'fa-regular fa-star';
  return (
    <i
      className={`${faClass} ${className}`}
      style={{
        fontSize: size,
        color: color || (isFilled ? (fill || '#FF8B00') : '#FF8B00'),
        lineHeight: 1,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        ...style,
      }}
      {...rest}
    />
  );
};
export const ThumbsUp      = mkIcon('fa-solid fa-thumbs-up');
export const MessageSquare = mkIcon('fa-solid fa-message');
export const Award         = mkIcon('fa-solid fa-award');
export const Sparkles      = mkIcon('fa-solid fa-wand-magic-sparkles');

// ─── Status & Alerts ─────────────────────────────────────────
export const CheckCircle   = mkIcon('fa-solid fa-circle-check');
export const CheckCircle2  = mkIcon('fa-solid fa-circle-check');
export const AlertCircle   = mkIcon('fa-solid fa-circle-exclamation');
export const AlertTriangle = mkIcon('fa-solid fa-triangle-exclamation');
export const Info          = mkIcon('fa-solid fa-circle-info');
export const Ban           = mkIcon('fa-solid fa-ban');

// ─── Location & Contact ──────────────────────────────────────
export const MapPin        = mkIcon('fa-solid fa-location-dot');
export const Phone         = mkIcon('fa-solid fa-phone');
export const Mail          = mkIcon('fa-solid fa-envelope');
export const Globe         = mkIcon('fa-solid fa-globe');
export const Building      = mkIcon('fa-solid fa-building');

// ─── Time & Calendar ─────────────────────────────────────────
export const Calendar      = mkIcon('fa-solid fa-calendar-days');
export const Clock         = mkIcon('fa-solid fa-clock');
export const CalendarCheck = mkIcon('fa-solid fa-calendar-check');

// ─── Technical / Service ─────────────────────────────────────
export const Wrench        = mkIcon('fa-solid fa-wrench');
export const Zap           = mkIcon('fa-solid fa-bolt');
export const Wind          = mkIcon('fa-solid fa-wind');
export const Snowflake = ({ size = 16, color, className = '', style = {}, ...rest }) => {
  return (
    <svg
      viewBox="0 0 512 512"
      width={size}
      height={size}
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        ...style
      }}
      {...rest}
    >
      <defs>
        <linearGradient id="iconSnowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0088FF" />
          <stop offset="100%" stopColor="#0052CC" />
        </linearGradient>
      </defs>
      <g stroke={color || 'url(#iconSnowGrad)'} fill={color || 'url(#iconSnowGrad)'} strokeLinecap="round" strokeLinejoin="round">
        {[0, 60, 120, 180, 240, 300].map((deg) => (
          <g key={deg} transform={`rotate(${deg} 256 256)`}>
            <line x1="256" y1="256" x2="256" y2="70" strokeWidth="12" />
            <line x1="256" y1="120" x2="206" y2="70" strokeWidth="10" />
            <line x1="256" y1="120" x2="306" y2="70" strokeWidth="10" />
            <line x1="206" y1="70" x2="206" y2="50" strokeWidth="8" />
            <line x1="306" y1="70" x2="306" y2="50" strokeWidth="8" />
            <line x1="256" y1="170" x2="216" y2="130" strokeWidth="8" />
            <line x1="256" y1="170" x2="296" y2="130" strokeWidth="8" />
            <line x1="256" y1="90" x2="236" y2="70" strokeWidth="6" />
            <line x1="256" y1="90" x2="276" y2="70" strokeWidth="6" />
            <polygon points="256,95 261,103 256,111 251,103" />
            <polygon points="256,145 263,155 256,165 249,155" />
          </g>
        ))}
        <polygon points="256,210 296,233 296,279 256,302 216,279 216,233" fill="none" strokeWidth="8" />
        <polygon points="256,225 283,241 283,271 256,287 229,271 229,241" opacity="0.3" />
      </g>
    </svg>
  );
};
export const Thermometer   = mkIcon('fa-solid fa-temperature-half');
export const Cpu           = mkIcon('fa-solid fa-microchip');
export const Database      = mkIcon('fa-solid fa-database');
export const Tool          = mkIcon('fa-solid fa-screwdriver-wrench');

// ─── Edit & Actions ──────────────────────────────────────────
export const Edit2         = mkIcon('fa-solid fa-pen');
export const Edit          = mkIcon('fa-solid fa-pencil');
export const Save          = mkIcon('fa-solid fa-floppy-disk');
export const Copy          = mkIcon('fa-solid fa-copy');
export const Download      = mkIcon('fa-solid fa-download');
export const Upload        = mkIcon('fa-solid fa-upload');
export const Share         = mkIcon('fa-solid fa-share-nodes');
export const Printer       = mkIcon('fa-solid fa-print');

// ─── Layout & Display ────────────────────────────────────────
export const Grid          = mkIcon('fa-solid fa-grid-2');
export const List          = mkIcon('fa-solid fa-list');
export const BarChart2     = mkIcon('fa-solid fa-chart-bar');
export const PieChart      = mkIcon('fa-solid fa-chart-pie');
export const LineChart     = mkIcon('fa-solid fa-chart-line');
export const Filter        = mkIcon('fa-solid fa-filter');
export const SortDesc      = mkIcon('fa-solid fa-sort-down');

// ─── Misc ─────────────────────────────────────────────────────
export const Truck         = mkIcon('fa-solid fa-truck-fast');
export const Box           = mkIcon('fa-solid fa-box-open');
export const Gift          = mkIcon('fa-solid fa-gift');
export const Heart         = mkIcon('fa-solid fa-heart');
export const Bookmark      = mkIcon('fa-solid fa-bookmark');
export const Image         = mkIcon('fa-solid fa-image');
export const Link          = mkIcon('fa-solid fa-link');
export const ExternalLink  = mkIcon('fa-solid fa-arrow-up-right-from-square');

// ─── Extra (AdminDashboard / TechnicianPortal) ─────────────────
export const TrendingUp    = mkIcon('fa-solid fa-arrow-trend-up');
export const DollarSign    = mkIcon('fa-solid fa-dollar-sign');
export const Activity      = mkIcon('fa-solid fa-wave-pulse');
export const Check         = mkIcon('fa-solid fa-check');
export const Camera        = mkIcon('fa-solid fa-camera');
export const Pencil        = mkIcon('fa-solid fa-pencil');
export const AlertOctagon  = mkIcon('fa-solid fa-octagon-exclamation');
export const XCircle       = mkIcon('fa-solid fa-circle-xmark');
export const MinusCircle   = mkIcon('fa-solid fa-circle-minus');
export const PlusCircle    = mkIcon('fa-solid fa-circle-plus');
export const Loader        = mkIcon('fa-solid fa-spinner fa-spin');
export const FileText      = mkIcon('fa-solid fa-file-lines');
export const LayoutDashboard = mkIcon('fa-solid fa-table-columns');
export const ToggleLeft    = mkIcon('fa-solid fa-toggle-off');
export const ToggleRight   = mkIcon('fa-solid fa-toggle-on');
export const CheckSquare   = mkIcon('fa-solid fa-square-check');
export const Square        = mkIcon('fa-regular fa-square');
export const ChevronUp     = mkIcon('fa-solid fa-chevron-up');
export const ArrowUp       = mkIcon('fa-solid fa-arrow-up');
export const ArrowDown     = mkIcon('fa-solid fa-arrow-down');

