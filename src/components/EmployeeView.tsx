import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import { LogOut, Gift, Shield, Upload } from 'lucide-react';
import { Employee, Benefit } from '../types';

interface EmployeeViewProps {
  user: Employee;
  onLogout: () => void;
  onShowBenefits: () => Promise<void>;
  showBenefits: boolean;
  setShowBenefits: React.Dispatch<React.SetStateAction<boolean>>;
  benefits: Benefit[];
  error?: string;
}

const Logo: React.FC<{ logoUrl: string }> = ({ logoUrl }) => {
  return (
    <div className="w-24 h-24 mx-auto">
      <div className="logo-spin">
        <img 
          src={logoUrl || '/api/placeholder/100/100'} 
          alt="Company Logo" 
          className="w-24 h-24 object-contain rounded-lg shadow-lg"
        />
      </div>
    </div>
  );
};

const ProfileImage: React.FC<{ imageUrl?: string; profileImageAdded?: boolean }> = ({ 
  imageUrl, 
  profileImageAdded 
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const [currentImageUrl, setCurrentImageUrl] = useState(imageUrl);

  useEffect(() => {
    setCurrentImageUrl(imageUrl);
  }, [imageUrl]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('profileImage', file);
    
    setIsUploading(true);
    setError('');
    
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/upload-profile-image`, {
        method: 'POST',
        credentials: 'include',
        body: formData
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to upload image');
      }
      
      const data = await response.json();
      setCurrentImageUrl(data.imageUrl);
      window.location.reload(); // Päivitä sivu näyttääksesi uuden tilan
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload image');
      console.error('Upload error:', err);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="relative mx-auto mt-4 mb-2 group">
      <img 
        src={currentImageUrl || '/api/placeholder/400/400'} 
        alt="Profile" 
        className="w-32 h-32 object-cover rounded-full shadow-lg mx-auto"
      />
      {!profileImageAdded && (
        <>
          <input
            type="file"
            id="profile-upload"
            className="hidden"
            accept="image/*"
            onChange={handleImageUpload}
            disabled={isUploading}
          />
          <label 
            htmlFor="profile-upload" 
            className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-full cursor-pointer"
          >
            <Upload className="h-6 w-6 text-white" />
          </label>
        </>
      )}
      {error && (
        <Alert variant="destructive" className="mt-2">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {isUploading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        </div>
      )}
    </div>
  );
};

const getMembershipColor = (level: string = 'BRONZE'): string => {
  switch (level.toUpperCase()) {
    case 'GOLD':
      return 'membership-color-gold';
    case 'SILVER':
      return 'membership-color-silver';
    case 'BRONZE':
      return 'membership-color-bronze';
    case 'PLATINUM':
      return 'membership-color-platinum';
    default:
      return 'bg-gradient-to-br from-blue-500 to-purple-600 text-white';
  }
};

const getMembershipGlow = (level: string): string => {
  switch (level.toUpperCase()) {
    case 'GOLD':
      return 'membership-glow-gold';
    case 'SILVER':
      return 'membership-glow-silver';
    case 'BRONZE':
      return 'membership-glow-bronze';
    case 'PLATINUM':
      return 'membership-glow-platinum';
    default:
      return '';
  }
};

export const EmployeeView: React.FC<EmployeeViewProps> = ({ 
  user, 
  onLogout, 
  onShowBenefits,
  showBenefits,
  setShowBenefits,
  benefits,
  error: propError 
}) => {
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);
  const [privacyPolicy, setPrivacyPolicy] = useState('');
  const [privacyError, setPrivacyError] = useState<string>('');
  const [error, setError] = useState<string>(propError || '');

  const fetchPrivacyPolicy = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/privacy-policy`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setPrivacyPolicy(data.content);
      } else {
        const errorText = await response.text();
        setPrivacyError(errorText || 'Tietosuojaselosteen lataus epäonnistui');
      }
    } catch (err) {
      console.error('Failed to fetch privacy policy:', err);
      setPrivacyError('Tietosuojaselosteen lataus epäonnistui');
    }
  };

  useEffect(() => {
    fetchPrivacyPolicy();
  }, []);

  useEffect(() => {
    if (propError) {
      setError(propError);
    }
  }, [propError]);

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('fi-FI');
  };

  if (error) {
    return (
      <Alert variant="destructive" className="m-4">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (showBenefits) {
    return (
      <Card className="max-w-md mx-auto">
        <CardHeader className="flex flex-row justify-between items-center">
          <h2 className="text-2xl font-bold">Edut ja alennukset</h2>
          <Button 
            variant="ghost"
            onClick={() => setShowBenefits(false)}
          >
            Takaisin
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {benefits.length > 0 ? (
              benefits.map((benefit) => (
                <div 
                  key={benefit.id} 
                  className="p-4 bg-white rounded-lg shadow transition-all hover:shadow-md"
                >
                  <h3 className="font-bold text-lg">{benefit.title}</h3>
                  <p className="text-gray-600 mt-2">{benefit.description}</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Voimassa: {formatDate(benefit.validUntil)}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500">
                Ei voimassaolevia etuja tällä hetkellä.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  const membershipLevel = user?.membershipLevel || 'BRONZE';
  const membershipColors = getMembershipColor(membershipLevel);
  const membershipGlow = getMembershipGlow(membershipLevel);

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <Card className={`max-w-md mx-auto ${membershipColors} ${membershipGlow} transition-all duration-300`}>
        <CardHeader className="text-center relative">
          <Logo logoUrl={user.logoUrl || '/api/placeholder/100/100'} />
          <div className="absolute top-4 right-4">
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20"
              onClick={() => setShowPrivacyPolicy(true)}
            >
              <Shield className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
        <ProfileImage imageUrl={user.profileImage} profileImageAdded={user.profileImageAdded} />
          
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-2">{user.name}</h2>
            <p className="text-lg opacity-90">{user.company}</p>
            <div className="mt-4">
              <span className="inline-block px-4 py-1 rounded-full bg-white/20 text-white text-sm font-semibold">
                {membershipLevel.toUpperCase()} MEMBER
              </span>
            </div>
            <div className="mt-4 space-y-1 text-sm opacity-80">
              {user.startDate && (
                <p>Aloituspäivä: {formatDate(user.startDate)}</p>
              )}
              <p>Voimassa: {formatDate(user.validUntil)}</p>
            </div>
          </div>
          
          <div className="flex justify-center space-x-4">
            <Button 
              onClick={onShowBenefits}
              className="bg-white/90 text-gray-800 hover:bg-white"
            >
              <Gift className="mr-2 h-4 w-4" />
              Edut
            </Button>
            <Button 
              onClick={onLogout}
              variant="outline" 
              className="border-white text-white hover:bg-white/20"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Kirjaudu ulos
            </Button>
          </div>
        </CardContent>
      </Card>

      {showPrivacyPolicy && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="max-w-lg w-full max-h-[80vh] overflow-auto bg-white">
            <CardHeader className="flex flex-row justify-between items-center sticky top-0 bg-white z-10">
              <h2 className="text-xl font-bold">Tietosuojaseloste</h2>
              <Button 
                variant="ghost"
                size="sm"
                onClick={() => setShowPrivacyPolicy(false)}
              >
                Sulje
              </Button>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm">
                {privacyError ? (
                  <Alert variant="destructive">
                    <AlertDescription>{privacyError}</AlertDescription>
                  </Alert>
                ) : privacyPolicy ? (
                  <div dangerouslySetInnerHTML={{ __html: privacyPolicy }} />
                ) : (
                  <p className="text-center text-gray-500">
                    Ladataan tietosuojaselostetta...
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default EmployeeView;