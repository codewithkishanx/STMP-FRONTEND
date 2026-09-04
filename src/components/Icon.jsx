// Feather-style inline SVG icons — zero-dependency lucide replacement.
const Svg = ({ size = 16, children }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {children}
  </svg>
);

export const Mail = ({ size }) => (<Svg size={size}><rect x="2" y="4" width="20" height="16" rx="0" /><polyline points="22,6 12,13 2,6" /></Svg>);
export const Lock = ({ size }) => (<Svg size={size}><rect x="3" y="11" width="18" height="11" rx="0" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></Svg>);
export const User = ({ size }) => (<Svg size={size}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></Svg>);
export const Eye = ({ size }) => (<Svg size={size}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></Svg>);
export const EyeOff = ({ size }) => (<Svg size={size}><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" /><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" /><path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></Svg>);
export const GraduationCap = ({ size }) => (<Svg size={size}><path d="M22 10L12 5 2 10l10 5 10-5z" /><path d="M6 12v5c0 1.7 2.7 3 6 3s6-1.3 6-3v-5" /><line x1="22" y1="10" x2="22" y2="16" /></Svg>);
export const UserCog = ({ size }) => (<Svg size={size}><path d="M18 21v-2a4 4 0 0 0-4-4h-4a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="3" /><circle cx="19" cy="8" r="2" /></Svg>);
export const ArrowRight = ({ size }) => (<Svg size={size}><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></Svg>);
export const CheckCircle2 = ({ size }) => (<Svg size={size}><circle cx="12" cy="12" r="10" /><polyline points="8.5 12.5 11 15 15.5 9.5" /></Svg>);
export const Camera = ({ size }) => (<Svg size={size}><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" /><circle cx="12" cy="13" r="4" /></Svg>);
export const Hash = ({ size }) => (<Svg size={size}><line x1="4" y1="9" x2="20" y2="9" /><line x1="4" y1="15" x2="20" y2="15" /><line x1="10" y1="3" x2="8" y2="21" /><line x1="16" y1="3" x2="14" y2="21" /></Svg>);
export const BookOpen = ({ size }) => (<Svg size={size}><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /></Svg>);
export const Layers = ({ size }) => (<Svg size={size}><polygon points="12 2 2 7 12 12 22 7 12 2" /><polyline points="2 12 12 17 22 12" /><polyline points="2 17 12 22 22 17" /></Svg>);
export const Bell = ({ size }) => (<Svg size={size}><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></Svg>);
export const BellRing = ({ size }) => (<Svg size={size}><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" /><path d="M4 2c.6.5 1 1.4 1 2.5" /><path d="M20 2c-.6.5-1 1.4-1 2.5" /></Svg>);
export const X = ({ size }) => (<Svg size={size}><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></Svg>);
export const Save = ({ size }) => (<Svg size={size}><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" /><polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" /></Svg>);
export const Briefcase = ({ size }) => (<Svg size={size}><rect x="2" y="7" width="20" height="14" rx="0" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></Svg>);
export const Building2 = ({ size }) => (<Svg size={size}><rect x="4" y="2" width="16" height="20" rx="0" /><line x1="9" y1="6" x2="9" y2="6" /><line x1="15" y1="6" x2="15" y2="6" /><line x1="9" y1="10" x2="9" y2="10" /><line x1="15" y1="10" x2="15" y2="10" /><line x1="9" y1="14" x2="9" y2="14" /><line x1="15" y1="14" x2="15" y2="14" /><path d="M10 22v-4h4v4" /></Svg>);
export const MessageSquareText = ({ size }) => (<Svg size={size}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /><line x1="8" y1="9" x2="16" y2="9" /><line x1="8" y1="12" x2="13" y2="12" /></Svg>);
export const Search = ({ size }) => (<Svg size={size}><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></Svg>);
export const Users = ({ size }) => (<Svg size={size}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></Svg>);
export const MessageCircle = ({ size }) => (<Svg size={size}><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" /></Svg>);
export const Send = ({ size }) => (<Svg size={size}><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></Svg>);
export const Clock = ({ size }) => (<Svg size={size}><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></Svg>);
export const ChevronRight = ({ size }) => (<Svg size={size}><polyline points="9 18 15 12 9 6" /></Svg>);
export const LayoutGrid = ({ size }) => (<Svg size={size}><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></Svg>);
export const ClipboardList = ({ size }) => (<Svg size={size}><rect x="8" y="2" width="8" height="4" rx="0" /><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" /><line x1="9" y1="12" x2="15" y2="12" /><line x1="9" y1="16" x2="13" y2="16" /></Svg>);
export const MessagesSquare = ({ size }) => (<Svg size={size}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /><path d="M8 9h8" /><path d="M8 12h5" /></Svg>);
