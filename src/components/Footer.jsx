import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import { useSettings } from '../hooks/useSettings';

const FacebookIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const InstagramIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

const YoutubeIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.42a2.78 2.78 0 0 0-1.94 2C1 8.14 1 11.72 1 11.72s0 3.58.46 5.3a2.78 2.78 0 0 0 1.94 2c1.72.42 8.6.42 8.6.42s6.88 0 8.6-.42a2.78 2.78 0 0 0 1.94-2c.46-1.72.46-5.3.46-5.3s0-3.58-.46-5.3z" />
    <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" />
  </svg>
);

const Footer = () => {
  const { settings } = useSettings();

  const internalLinks = [
    { label: 'Trang chủ', to: '/' },
    { label: 'Giới thiệu', to: '/gioi-thieu' },
    { label: 'Đặt sân', to: '/dat-san' },
    { label: 'Sản phẩm', to: '/san-pham' },
  ];

  const socialLinks = [
    { icon: <FacebookIcon size={12} />, href: settings.facebook_url || '#' },
    { icon: <InstagramIcon size={12} />, href: settings.instagram_url || '#' },
    { icon: <YoutubeIcon size={12} />, href: settings.youtube_url || '#' }
  ];

  return (
    <footer className="bg-[#0a0f0a] text-white pt-6 pb-4">
      <div className="container px-4">
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 lg:gap-10 mb-6">
          {/* Brand */}
          <div className="col-span-2 sm:col-span-2 lg:col-span-1">
            <Link to="/" className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 bg-[#008200] rounded-lg flex items-center justify-center text-white font-black text-lg shrink-0">TT</div>
              <div className="flex flex-col leading-none">
                <span className="font-black text-base sm:text-lg tracking-tight text-white uppercase">{settings.site_name || 'THAOTRANG'}</span>
                <span className="text-[7px] uppercase tracking-[0.2em] font-bold text-[#ccff00]">Badminton</span>
              </div>
            </Link>
            <p className="text-white/70 text-xs leading-relaxed max-w-xs">
              {settings.site_description || 'Hệ thống sân cầu lông đẳng cấp quốc tế.'}
            </p>
          </div>

          {/* Links */}
          <div className="flex flex-col gap-1">
            {internalLinks.map((link, idx) => (
              <Link key={idx} to={link.to} className="text-white/80 hover:text-[#ccff00] text-[12px] sm:text-[13px] transition-colors">
                {link.label}
              </Link>
            ))}
          </div>

          {/* Contact */}
          <div className="flex flex-col gap-2">
            <div className="flex items-start gap-2">
              <MapPin size={12} className="text-[#ccff00] shrink-0 mt-0.5" />
              <span className="text-white/80 text-[11px] sm:text-[12px] leading-relaxed">
                {settings.address || '123 Đường Cầu Lông, Quận 7, TP. HCM'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Phone size={12} className="text-[#ccff00] shrink-0" />
              <span className="text-white/80 text-[12px] sm:text-[13px]">
                {settings.phone || '090 123 4567'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Mail size={12} className="text-[#ccff00] shrink-0" />
              <span className="text-white/80 text-[11px] sm:text-[12px]">
                {settings.email || 'contact@thaotrang.vn'}
              </span>
            </div>
          </div>

          {/* Newsletter + Social */}
          <div className="col-span-2 sm:col-span-1">
            <div className="relative mb-3">
              <input
                type="email"
                placeholder="Email của bạn"
                className="w-full bg-white/5 border border-white/10 rounded-lg py-2 pl-3 pr-9 text-[11px] text-white outline-none focus:border-[#ccff00] transition-colors"
              />
              <button className="absolute right-1 top-1/2 -translate-y-1/2 w-6 h-6 bg-[#008200] rounded-md flex items-center justify-center hover:bg-[#ccff00] transition-colors">
                <Send size={10} />
              </button>
            </div>
            <div className="flex gap-2">
              {socialLinks.map((social, idx) => (
                <a key={idx} href={social.href} target="_blank" rel="noreferrer" className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:bg-[#008200] transition-all">
                  {social.icon}
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-white/5 pt-3">
          <p className="text-white/40 text-[8px] font-bold uppercase tracking-[0.2em] text-center">
            © 2026 THAOTRANG BADMINTON. All Rights Reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
