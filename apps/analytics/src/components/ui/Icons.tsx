// Inline SVG icons traced from the live Analytics DOM (MUI + custom Rubik icon set). Colors are props so states can recolor.
import type { SVGProps } from 'react';

type P = SVGProps<SVGSVGElement> & { color?: string; size?: number };

export function CollapseIcon({ size = 34, color = '#fff', ...rest }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 34 33" {...rest}>
      <g transform="translate(0 33.244) rotate(-90)">
        <path d="M5.6,5.6a.8.8,0,0,1-.512-.184l-4.8-4A.8.8,0,0,1,1.312.185L5.6,3.767,9.884.313a.8.8,0,0,1,1.127.12A.8.8,0,0,1,10.9,1.6L6.1,5.462A.8.8,0,0,1,5.6,5.6Z" transform="translate(9.893 12.85)" fill={color} />
        <line y2="10" transform="translate(20.744 21.15) rotate(90)" fill="none" stroke={color} strokeLinecap="round" strokeWidth="1.5" />
      </g>
    </svg>
  );
}

export function ChevronDownIcon({ size = 40, color = '#fff', ...rest }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" {...rest}>
      <path d="M15.5,21.5a1.142,1.142,0,0,1-.731-.263L7.911,15.521a1.144,1.144,0,0,1,1.462-1.759L15.5,18.88l6.123-4.935a1.171,1.171,0,1,1,1.451,1.839L16.215,21.3A1.142,1.142,0,0,1,15.5,21.5Z" transform="translate(4.502 2.502)" fill={color} />
    </svg>
  );
}

export function DashboardIcon({ size = 32, color = '#babdcc', ...rest }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" {...rest}>
      <g transform="translate(4 4)">
        <path d="M2.25,13.5A8.25,8.25,0,0,1,10.5,5.25a.75.75,0,0,1,.75.75v6.75H18a.75.75,0,0,1,.75.75,8.25,8.25,0,0,1-16.5,0Z" fill={color} fillRule="evenodd" />
        <path d="M12.75,3a.75.75,0,0,1,.75-.75,8.25,8.25,0,0,1,8.25,8.25.75.75,0,0,1-.75.75H13.5a.75.75,0,0,1-.75-.75Z" fill={color} fillRule="evenodd" />
      </g>
    </svg>
  );
}

export function PortfolioIcon({ size = 32, color = '#babdcc', ...rest }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" {...rest}>
      <g transform="translate(4 4)">
        <path d="M4,11H8a1,1,0,0,1,1,1v8a1,1,0,0,1-1,1H6a3,3,0,0,1-3-2.824L3,18V12A1,1,0,0,1,4,11Z" fill={color} />
        <path d="M21,12v6a3,3,0,0,1-2.824,3L18,21H12a1,1,0,0,1-1-1V12a1,1,0,0,1,1-1h8a1,1,0,0,1,1,1Z" fill={color} />
        <path d="M18,3a3,3,0,0,1,3,2.824L21,6V8a1,1,0,0,1-1,1H12a1,1,0,0,1-1-1V4a1,1,0,0,1,1-1h6Z" fill={color} />
        <path d="M9,4V8A1,1,0,0,1,8,9H4A1,1,0,0,1,3,8V6A3,3,0,0,1,5.824,3L6,3H8A1,1,0,0,1,9,4Z" fill={color} />
      </g>
    </svg>
  );
}

export function EquityExposureIcon({ size = 32, color = '#babdcc', ...rest }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" {...rest}>
      <g transform="translate(0.999 -2)">
        <g transform="translate(8.223 20.358)">
          <path d="M352,144h4.187v4.187" transform="translate(-340.634 -144)" fill="none" stroke={color} strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
          <path d="M48,167.776l4.538-4.538a1.2,1.2,0,0,1,1.692,0l1.9,1.9a1.2,1.2,0,0,0,1.692,0L62.955,160" transform="translate(-48 -159.402)" fill="none" stroke={color} strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
        </g>
        <g transform="translate(3.5 3.499)">
          <path d="M38.187,21.246h.834v.895a.447.447,0,0,0,.895,0v-.895h.834a.4.4,0,0,0,.386-.386V15.53a.386.386,0,0,0-.386-.386h-.834v-.9a.447.447,0,0,0-.895,0v.895h-.834a.4.4,0,0,0-.386.386V20.88a.369.369,0,0,0,.386.366Z" transform="translate(-28.119 -8.205)" fill={color} />
          <path d="M3.721,40.064a.447.447,0,1,0,.895,0V39.17H5.45a.4.4,0,0,0,.386-.386V33.432a.386.386,0,0,0-.386-.386H4.615v-.895a.447.447,0,1,0-.895,0v.895H2.886a.386.386,0,0,0-.386.386v5.351a.386.386,0,0,0,.386.386h.834Z" transform="translate(0 -22.465)" fill={color} />
          <path d="M73.488,10.947h.834v.895a.447.447,0,0,0,.895,0v-.895h.834a.4.4,0,0,0,.386-.386V5.23a.386.386,0,0,0-.386-.386h-.834v-.9a.447.447,0,0,0-.895,0v.895h-.834a.386.386,0,0,0-.386.386v5.351a.369.369,0,0,0,.386.366Z" transform="translate(-56.238)" fill={color} />
        </g>
      </g>
    </svg>
  );
}

export function DotsIcon({ size = 32, color = '#fff', ...rest }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" {...rest}>
      <path d="M7.472,12.361A1.111,1.111,0,1,1,6.361,11.25,1.111,1.111,0,0,1,7.472,12.361Zm8.889,0A1.111,1.111,0,1,1,15.25,11.25,1.111,1.111,0,0,1,16.361,12.361Zm8.889,0a1.111,1.111,0,1,1-1.111-1.111A1.111,1.111,0,0,1,25.25,12.361Z" transform="translate(1.25 3.25)" fill={color} stroke={color} strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
    </svg>
  );
}

export function TriangleIcon({ size = 16, color = '#fff', down = false, ...rest }: P & { down?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" {...rest} style={{ transform: down ? 'rotate(180deg)' : undefined, ...rest.style }}>
      <path d="M5,.514a1,1,0,0,1,1.748,0l4.873,8.769a1,1,0,0,1-.874,1.486H1A1,1,0,0,1,.127,9.283Z" transform="translate(2 2.556)" fill={color} />
    </svg>
  );
}

export function ChevronRightIcon({ size = 13, color = '#fff', left = false, ...rest }: P & { left?: boolean }) {
  return (
    <svg width={Math.round(size * 0.56)} height={size} viewBox="0 0 7.129 12.758" {...rest} style={{ transform: left ? 'rotate(180deg)' : undefined, ...rest.style }}>
      <path d="M0,0,5.318,5.318,0,10.637" transform="translate(1.061 1.061)" fill="none" stroke={color} strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
    </svg>
  );
}

export function SearchIcon({ size = 40, color = '#babdcc', ...rest }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" {...rest}>
      <path d="M21,21l-5.2-5.2m0,0A7.5,7.5,0,1,0,5.2,15.8,7.5,7.5,0,0,0,15.8,15.8Z" transform="translate(8 8)" fill="none" stroke={color} strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
    </svg>
  );
}

export function ExternalIcon({ size = 24, color = '#5f6f57', ...rest }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...rest}>
      <g transform="translate(-0.5 -0.5)">
        <path d="M17.235,4.5l2.927,2.927L13.94,13.65,15.2,14.907l6.222-6.222,2.927,2.927V4.5Z" transform="translate(-3.846)" fill={color} />
        <path d="M18.722,18.722H6.278V6.278H12.5L10.722,4.5H6.278A1.779,1.779,0,0,0,4.5,6.278V18.722A1.779,1.779,0,0,0,6.278,20.5H18.722A1.779,1.779,0,0,0,20.5,18.722V14.278L18.722,12.5Z" fill={color} />
      </g>
    </svg>
  );
}

export function WrenchIcon({ size = 40, color = '#3A3D4D', ...rest }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" {...rest}>
      <path d="M14.5178 17.8085H17.807V14.5192L13.9691 10.6813C15.1967 10.0951 16.5758 9.90376 17.9167 10.1338C19.2575 10.3639 20.494 11.0039 21.4559 11.9659C22.4179 12.9278 23.0579 14.1643 23.288 15.5051C23.518 16.8459 23.3267 18.2251 22.7404 19.4527L29.3189 26.0312C29.7551 26.4673 30.0002 27.0589 30.0002 27.6758C30.0002 28.2926 29.7551 28.8842 29.3189 29.3204C28.8828 29.7566 28.2912 30.0016 27.6743 30.0016C27.0575 30.0016 26.4659 29.7566 26.0297 29.3204L19.4512 22.7419C18.2236 23.3282 16.8445 23.5195 15.5037 23.2894C14.1629 23.0594 12.9263 22.4193 11.9644 21.4574C11.0025 20.4954 10.3624 19.2589 10.1323 17.9181C9.9023 16.5773 10.0936 15.1982 10.6799 13.9706L14.5169 17.8076" stroke={color} strokeWidth="1.31046" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ListIcon({ size = 40, color = '#12131A', ...rest }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" {...rest}>
      <path d="M11 27.05a.95.95 0 0 1 0 1.9H9a.95.95 0 0 1 0-1.9h2Zm20 0a.95.95 0 0 1 0 1.9H16a.95.95 0 0 1 0-1.9h15ZM11 19.05a.95.95 0 0 1 0 1.9H9a.95.95 0 0 1 0-1.9h2Zm20 0a.95.95 0 0 1 0 1.9H16a.95.95 0 0 1 0-1.9h15ZM11 11.05a.95.95 0 0 1 0 1.9H9a.95.95 0 0 1 0-1.9h2Zm20 0a.95.95 0 0 1 0 1.9H16a.95.95 0 0 1 0-1.9h15Z" fill={color} stroke={color} strokeWidth="0.4" />
    </svg>
  );
}

export function ReportStudioIcon({ size = 28, color = '#515466', ...rest }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none" {...rest}>
      <path d="M22.1667 16.334V13.2715C22.1667 12.2272 21.7519 11.2257 21.0135 10.4873C20.2751 9.74883 19.2735 9.33398 18.2292 9.33398H16.4792C16.1311 9.33398 15.7973 9.1957 15.5512 8.94956C15.305 8.70342 15.1667 8.36958 15.1667 8.02148V6.27148C15.1667 5.22719 14.7519 4.22568 14.0135 3.48725C13.2751 2.74883 12.2735 2.33398 11.2292 2.33398H9.04175M9.04175 17.209H17.7917M9.04175 20.709H13.4167M11.6667 2.33398H5.97925C5.25475 2.33398 4.66675 2.92198 4.66675 3.64648V23.7715C4.66675 24.496 5.25475 25.084 5.97925 25.084H20.8542C21.5787 25.084 22.1667 24.496 22.1667 23.7715V12.834C22.1667 10.0492 21.0605 7.37849 19.0914 5.40936C17.1222 3.44023 14.4515 2.33398 11.6667 2.33398Z" stroke={color} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function BarsIcon({ size = 48, color = '#12131a', bg = '#f5f5f6', ...rest }: P & { bg?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" {...rest}>
      <rect width="48" height="48" rx="8" fill={bg} />
      <path d="M6,13H2a.945.945,0,0,0-1,1H1v8a.945.945,0,0,0,1,1H6a.945.945,0,0,0,1-1H7V14a.945.945,0,0,0-1-1ZM22,9H18a.945.945,0,0,0-1,1h0V22a.945.945,0,0,0,1,1h4a.945.945,0,0,0,1-1h0V10a.945.945,0,0,0-1-1ZM14,1H10A.945.945,0,0,0,9,2H9V22a.945.945,0,0,0,1,1h4a.945.945,0,0,0,1-1h0V2a.945.945,0,0,0-1-1Z" transform="translate(12 13)" fill={color} />
    </svg>
  );
}

export function SlidersIcon({ size = 40, color = '#5f6f57', bg = '#cfe3c9', ...rest }: P & { bg?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" {...rest}>
      <rect width="40" height="40" rx="3" fill={bg} />
      <g transform="translate(4.193 7.621)" fill="none" stroke={color} strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5">
        <circle cx="3" cy="3" r="3" transform="translate(15.806 4.379)" />
        <line x2="10" transform="translate(5.807 7.379)" />
        <line x2="5" transform="translate(21.807 7.379)" />
        <g transform="translate(2 2)">
          <circle cx="3" cy="3" r="3" transform="translate(6.807 12.379)" />
          <line x2="3" transform="translate(3.807 15.379)" />
          <line x2="12" transform="translate(12.807 15.379)" />
        </g>
      </g>
    </svg>
  );
}

export function PersonIcon({ size = 24, color = '#babdcc', ...rest }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...rest}>
      <circle cx="12" cy="8" r="3.25" stroke={color} strokeWidth="1.5" />
      <path d="M5.5 19.5c0-3.3 2.9-5.5 6.5-5.5s6.5 2.2 6.5 5.5" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function GroupIcon({ size = 24, color = '#babdcc', ...rest }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...rest}>
      <circle cx="9" cy="8" r="3" stroke={color} strokeWidth="1.5" />
      <circle cx="16.5" cy="9" r="2.4" stroke={color} strokeWidth="1.5" />
      <path d="M3.5 19c0-3 2.5-5 5.5-5s5.5 2 5.5 5" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <path d="M15.5 14.2c2.6.1 5 1.9 5 4.8" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function PlusIcon({ size = 24, color = '#ebecf2', ...rest }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...rest}>
      <path d="M12 5v14M5 12h14" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function SwapIcon({ size = 32, color = '#ebecf2', ...rest }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" {...rest}>
      <rect x="4" y="4" width="24" height="24" rx="5" stroke={color} strokeWidth="1.5" />
      <path d="M11 13.5h9l-2.5-2.5M21 18.5h-9l2.5 2.5" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function CloseIcon({ size = 24, color = '#12131a', ...rest }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...rest}>
      <path d="M6 6l12 12M18 6L6 18" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function InfoIcon({ size = 16, color = '#5f854c', ...rest }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" {...rest}>
      <circle cx="8" cy="8" r="8" fill={color} />
      <path d="M8 7v4.2M8 4.8v.2" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function DownloadIcon({ size = 20, color = '#12131a', ...rest }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" {...rest}>
      <path d="M10 3v9m0 0 3.5-3.5M10 12 6.5 8.5M4 14.5v1A1.5 1.5 0 0 0 5.5 17h9a1.5 1.5 0 0 0 1.5-1.5v-1" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function SortIcon({ size = 12, active = false, dir = 'desc', ...rest }: P & { active?: boolean; dir?: 'asc' | 'desc' }) {
  if (active) {
    return (
      <svg width={size} height={size} viewBox="0 0 12 12" fill="none" {...rest} style={{ transform: dir === 'asc' ? 'rotate(180deg)' : undefined }}>
        <path d="M6 2v8M3 7l3 3 3-3" stroke="#12131a" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  return (
    <svg width={size} height={size} viewBox="0 0 12 12" fill="none" {...rest}>
      <path d="M3.5 4.5 6 2l2.5 2.5M3.5 7.5 6 10l2.5-2.5" stroke="#12131a" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ArrowLeftIcon({ size = 20, color = '#12131a', ...rest }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" {...rest}>
      <path d="M17 10H3m0 0 5-5m-5 5 5 5" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function EyeIcon({ size = 20, color = '#fff', ...rest }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...rest}>
      <path d="M2 12s3.6-6 10-6 10 6 10 6-3.6 6-10 6S2 12 2 12Z" stroke={color} strokeWidth="1.6" />
      <circle cx="12" cy="12" r="3" stroke={color} strokeWidth="1.6" />
    </svg>
  );
}

export function EditIcon({ size = 20, color = '#12131a', ...rest }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...rest}>
      <path d="M4 20h4l10.5-10.5a2.1 2.1 0 0 0-3-3L5 17v3Z" stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
      <path d="m13.5 8.5 3 3" stroke={color} strokeWidth="1.5" />
    </svg>
  );
}

export function DragIcon({ size = 16, color = '#babdcc', ...rest }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" {...rest}>
      {[4, 8, 12].map((y) => (<g key={y}><circle cx="6" cy={y} r="1.2" fill={color} /><circle cx="10" cy={y} r="1.2" fill={color} /></g>))}
    </svg>
  );
}

export function ExpandIcon({ size = 16, color = '#12131a', ...rest }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" {...rest}>
      <path d="M9.5 2.5h4v4M13.5 2.5 9 7M6.5 13.5h-4v-4M2.5 13.5 7 9" stroke={color} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function DocIcon({ size = 20, color = '#12131a', ...rest }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" {...rest}>
      <path d="M5 2.5h6.5L15 6v11.5H5V2.5Z" stroke={color} strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M11.5 2.5V6H15M7.5 10h5M7.5 13h5" stroke={color} strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

export function PersonGearIcon({ size = 20, color = '#12131a', ...rest }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...rest}>
      <circle cx="10" cy="8" r="3.2" stroke={color} strokeWidth="1.5" />
      <path d="M3.5 19.5c0-3.3 2.9-5.5 6.5-5.5 1 0 2 .2 2.8.5" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="17.5" cy="17" r="2" stroke={color} strokeWidth="1.3" />
      <path d="M17.5 13.5v1.2M17.5 19.3v1.2M14 17h1.2M19.8 17H21" stroke={color} strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

export function HelpIcon({ size = 20, color = '#12131a', ...rest }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...rest}>
      <circle cx="12" cy="12" r="9" stroke={color} strokeWidth="1.5" />
      <path d="M9.6 9.6a2.4 2.4 0 1 1 3.4 2.2c-.7.4-1 1-1 1.7M12 16.8v.2" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function HeadsetIcon({ size = 20, color = '#12131a', ...rest }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...rest}>
      <path d="M4 13a8 8 0 0 1 16 0" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <rect x="3" y="12" width="4" height="6" rx="1.5" stroke={color} strokeWidth="1.5" />
      <rect x="17" y="12" width="4" height="6" rx="1.5" stroke={color} strokeWidth="1.5" />
      <path d="M19 18c0 1.7-1.5 3-3.5 3H13" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function InfoCircleIcon({ size = 20, color = '#12131a', ...rest }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...rest}>
      <circle cx="12" cy="12" r="9" stroke={color} strokeWidth="1.5" />
      <path d="M12 11v5M12 8v.2" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function LogoutIcon({ size = 20, color = '#12131a', ...rest }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...rest}>
      <path d="M10 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h4M15 8l4 4-4 4M19 12H9" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function WalletIcon({ size = 20, color = '#12131a', ...rest }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...rest}>
      <rect x="3" y="6" width="18" height="13" rx="2" stroke={color} strokeWidth="1.5" />
      <path d="M3 10h18M16 14.5h2" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function CalendarIcon({ size = 20, color = '#12131a', ...rest }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...rest}>
      <rect x="3" y="5" width="18" height="15" rx="2" stroke={color} strokeWidth="1.5" />
      <path d="M3 9.5h18M8 3v4M16 3v4M7 13h3v3H7z" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function SackIcon({ size = 16, color = '#12131a', ...rest }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...rest}>
      <path d="M9 3h6l-2 3h-2L9 3Z" stroke={color} strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M11 6h2c3.5 2.2 6 5.6 6 9a7 7 0 0 1-14 0c0-3.4 2.5-6.8 6-9Z" stroke={color} strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M12 11v6M10.5 15.5c.3.6 1 1 1.5 1 .9 0 1.5-.5 1.5-1.2 0-1.6-3-1-3-2.6 0-.7.6-1.2 1.5-1.2.5 0 1.2.3 1.5.9" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

export function PercentIcon({ size = 16, color = '#fff', ...rest }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" {...rest}>
      <path d="M12 4 4 12" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="5" cy="5" r="1.6" stroke={color} strokeWidth="1.4" />
      <circle cx="11" cy="11" r="1.6" stroke={color} strokeWidth="1.4" />
    </svg>
  );
}

export function ArrowDownRedIcon({ size = 20, color = '#c94c40', ...rest }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" {...rest}>
      <path d="M10 3v14m0 0 5-5m-5 5-5-5" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function TrendIcon({ size = 20, color = '#12131a', ...rest }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...rest}>
      <path d="M4 20h16M6 16l4-5 3 3 5-7" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M15 7h3v3" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function LeaderboardIcon({ size = 20, color = '#12131a', ...rest }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...rest}>
      <rect x="3" y="11" width="5" height="9" rx="1" stroke={color} strokeWidth="1.5" />
      <rect x="9.5" y="5" width="5" height="15" rx="1" stroke={color} strokeWidth="1.5" />
      <rect x="16" y="9" width="5" height="11" rx="1" stroke={color} strokeWidth="1.5" />
    </svg>
  );
}

export function CheckCircleIcon({ size = 20, color = '#5f854c', ...rest }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...rest}>
      <circle cx="12" cy="12" r="10" fill={color} />
      <path d="m7.5 12.5 3 3 6-6.5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
