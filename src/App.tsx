import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from './components/ui/card';
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';
import { Alert, AlertDescription } from './components/ui/alert';
import { User } from 'lucide-react';
import { Employee, Benefit } from './types';
import AdminPanel from './components/AdminPanel';
import { EmployeeView } from './components/EmployeeView';

interface LoginProps {
  onLogin: (user: Employee) => void;
}

interface FormData {
  username: string;
  password: string;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [formData, setFormData] = useState<FormData>({ username: '', password: '' });
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/login`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage;
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error;
        } catch {
          errorMessage = errorText || 'Kirjautumisvirhe';
        }
        setError(errorMessage);
        return;
      }
      
      const data = await response.json();
      onLogin(data.user);
    } catch (err) {
      console.error('Login error:', err);
      setError('Verkkovirhe. Tarkista yhteys.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  return (
    <Card className="max-w-md mx-auto mt-8">
      <CardHeader>
        <h2 className="text-2xl font-bold text-center">Kirjaudu sisään</h2>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="username" className="text-sm font-medium">
              Käyttäjätunnus
            </label>
            <Input
              id="username"
              type="text"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              required
              autoComplete="username"
              autoFocus
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium">
              Salasana
            </label>
            <Input
              id="password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              required
              autoComplete="current-password"
              disabled={isLoading}
            />
          </div>
          
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <Button 
            type="submit" 
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="mr-2">Kirjaudutaan...</span>
              </>
            ) : (
              <>
                <User className="mr-2 h-4 w-4" />
                Kirjaudu
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

const App: React.FC = () => {
  const [user, setUser] = useState<Employee | null>(null);
  const [showBenefits, setShowBenefits] = useState<boolean>(false);
  const [benefits, setBenefits] = useState<Benefit[]>([]);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/check-auth`, {
          credentials: 'include',
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          let errorMessage;
          try {
            const errorData = JSON.parse(errorText);
            errorMessage = errorData.error;
          } catch {
            errorMessage = errorText || 'Kirjautumisen tarkistus epäonnistui';
          }
          setError(errorMessage);
          return;
        }
  
        const data = await response.json();
        console.log("Check auth response data:", data);
        setUser({ ...data, isAdmin: data.isAdmin });
      } catch (err) {
        console.error('Auth check failed:', err);
        setError('Kirjautumisen tarkistus epäonnistui');
      }
    };
    checkAuth();
  }, []);

  const handleLogout = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/logout`, { 
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage;
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error;
        } catch {
          errorMessage = errorText || 'Uloskirjautuminen epäonnistui';
        }
        setError(errorMessage);
        return;
      }
  
      setUser(null);
      setBenefits([]);
      setShowBenefits(false);
    } catch (err) {
      console.error('Logout failed:', err);
      setError('Uloskirjautuminen epäonnistui');
    }
  };

  const handleShowBenefits = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/benefits`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage;
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error;
        } catch {
          errorMessage = errorText || 'Etujen hakeminen epäonnistui';
        }
        setError(errorMessage);
        return;
      }
  
      const data = await response.json();
      setBenefits(data);
      setShowBenefits(true);
    } catch (err) {
      console.error('Failed to fetch benefits:', err);
      setError('Verkkovirhe etujen hakemisessa');
    }
  };

  if (!user) {
    return <Login onLogin={setUser} />;
  }

  if (user.isAdmin) {
     console.log("User data before admin check:", user);
    return (
      <div className="min-h-screen bg-gray-100">
        <AdminPanel />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <EmployeeView
        user={user}
        onLogout={handleLogout}
        onShowBenefits={handleShowBenefits}
        showBenefits={showBenefits}
        setShowBenefits={setShowBenefits}
        benefits={benefits}
        error={error}
      />
    </div>
  );
};

export default App;