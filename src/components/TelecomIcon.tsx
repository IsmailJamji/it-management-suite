import React from 'react';

interface TelecomIconProps {
  provider: string;
  size?: number;
  className?: string;
}

const TelecomIcon: React.FC<TelecomIconProps> = ({ provider, size = 24, className }) => {
  const iconStyle = {
    width: size,
    height: size,
  };

  const getProviderIcon = () => {
    const providerLower = provider.toLowerCase();
    
    switch (providerLower) {
      case 'inwi':
        return (
          <div className="flex items-center justify-center" style={iconStyle}>
            <img 
              src="./assets/inwi-logo.png" 
              alt="INWI" 
              style={{ 
                width: size, 
                height: size, 
                objectFit: 'contain' 
              }} 
              className={className}
              onError={(e) => {
                // Fallback to colored circle
                e.currentTarget.style.display = 'none';
                const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                if (fallback) fallback.style.display = 'block';
              }}
            />
            <div 
              style={{ display: 'none', width: size, height: size }}
              className="bg-purple-500 rounded-full flex items-center justify-center text-white font-bold text-xs"
            >
              IN
            </div>
          </div>
        );
      
      case 'orange':
        return (
          <div className="flex items-center justify-center" style={iconStyle}>
            <img 
              src="./assets/orange-logo.png" 
              alt="Orange" 
              style={{ 
                width: size, 
                height: size, 
                objectFit: 'contain' 
              }} 
              className={className}
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                if (fallback) fallback.style.display = 'block';
              }}
            />
            <div 
              style={{ display: 'none', width: size, height: size }}
              className="bg-orange-500 rounded-full flex items-center justify-center text-white font-bold text-xs"
            >
              OR
            </div>
          </div>
        );
      
      case 'iam':
        return (
          <div className="flex items-center justify-center" style={iconStyle}>
            <img 
              src="./assets/iam-logo.png" 
              alt="IAM" 
              style={{ 
                width: size, 
                height: size, 
                objectFit: 'contain' 
              }} 
              className={className}
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                if (fallback) fallback.style.display = 'block';
              }}
            />
            <div 
              style={{ display: 'none', width: size, height: size }}
              className="bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-xs"
            >
              IA
            </div>
          </div>
        );
      
      default:
        return (
          <div 
            style={iconStyle}
            className="bg-gray-500 rounded-full flex items-center justify-center text-white font-bold text-xs"
          >
            {provider.charAt(0).toUpperCase()}
          </div>
        );
    }
  };

  return getProviderIcon();
};

export default TelecomIcon;


