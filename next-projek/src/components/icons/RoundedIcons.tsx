import React from 'react';
import { 
  Heart, 
  MessageCircle, 
  Share, 
  Bookmark, 
  Home, 
  Compass, 
  Bell, 
  Settings, 
  Search, 
  Image, 
  Video, 
  BarChart3, 
  Globe, 
  Smile, 
  MoreHorizontal, 
  Shield,
  Sun,
  Moon,
  Wallet,
  Menu,
  Hash,
  Users,
  TrendingUp,
  Zap,
  Star,
  Repeat2,
  Eye,
  Plus,
  Send,
  Camera,
  Download,
  X
} from 'lucide-react';

interface IconProps {
  className?: string;
}

// Regular Icon Components
export const RoundedHeart: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <Heart className={className} />
);

export const RoundedMessage: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <MessageCircle className={className} />
);

export const RoundedShare: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <Share className={className} />
);

export const RoundedBookmark: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <Bookmark className={className} />
);

export const RoundedHome: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <Home className={className} />
);

export const RoundedCompass: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <Compass className={className} />
);

export const RoundedBell: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <Bell className={className} />
);

export const RoundedSettings: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <Settings className={className} />
);

export const RoundedSearch: React.FC<IconProps> = ({ className = "w-4 h-4" }) => (
  <Search className={className} />
);

export const RoundedImage: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <Image className={className} />
);

export const RoundedVideo: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <Video className={className} />
);

export const RoundedChart: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <BarChart3 className={className} />
);

export const RoundedGlobe: React.FC<IconProps> = ({ className = "w-4 h-4" }) => (
  <Globe className={className} />
);

export const RoundedSmile: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <Smile className={className} />
);

export const RoundedMore: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <MoreHorizontal className={className} />
);

export const RoundedShield: React.FC<IconProps> = ({ className = "w-4 h-4" }) => (
  <Shield className={className} />
);

export const RoundedSun: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <Sun className={className} />
);

export const RoundedMoon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <Moon className={className} />
);

export const RoundedWallet: React.FC<IconProps> = ({ className = "w-4 h-4" }) => (
  <Wallet className={className} />
);

export const RoundedMenu: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <Menu className={className} />
);

export const RoundedHash: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <Hash className={className} />
);

export const RoundedUsers: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <Users className={className} />
);

export const RoundedTrendingUp: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <TrendingUp className={className} />
);

export const RoundedZap: React.FC<IconProps> = ({ className = "w-4 h-4" }) => (
  <Zap className={className} />
);

export const RoundedStar: React.FC<IconProps> = ({ className = "w-4 h-4" }) => (
  <Star className={className} />
);

export const RoundedRepeat2: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <Repeat2 className={className} />
);

export const RoundedEye: React.FC<IconProps> = ({ className = "w-4 h-4" }) => (
  <Eye className={className} />
);

export const RoundedPlus: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <Plus className={className} />
);

export const RoundedSend: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <Send className={className} />
);

export const RoundedCamera: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <Camera className={className} />
);

export const RoundedDownload: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <Download className={className} />
);

export const RoundedX: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <X className={className} />
);

export const RoundedClose: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <X className={className} />
);