import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from './components/ui/card';
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';
import { Alert, AlertDescription } from './components/ui/alert';
import { User } from 'lucide-react';
import { Employee, Benefit } from './types';
import AdminPanel from './components/AdminPanel';
import { EmployeeView } from './components/EmployeeView';
import apiClient from './apiClient';

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
    
    const { data, error } = await apiClient.post<{ user: Employee; accessToken: string }>('/api/login', formData);
    
    if (error) {
      setError(error);
      setIsLoading(false);
      return;
    }
    
    if (data) {
      localStorage.setItem('token', data.accessToken); // Store the token
      onLogin({ ...data.user, isAdmin: data.user.isAdmin });
    }
    
    setIsLoading(false);
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
      const { data, error } = await apiClient.get<Employee>('/api/check-auth');
      
      if (error) {
        setError(error);
        return;
      }
      
      if (data) {
        setUser({ ...data, isAdmin: data.isAdmin });
      }
    };
    checkAuth();
  }, []);

  const handleLogout = async () => {
    const { data, error } = await apiClient.post('/api/logout');
    
    if (error) {
      setError('Logout failed');
      return;
    }
    
    if (data) {
      setUser(null);
      setBenefits([]);
      setShowBenefits(false);
    }
  };

  const handleShowBenefits = async () => {
    const { data, error } = await apiClient.get<Benefit[]>('/api/benefits');
    
    if (error) {
      setError(error);
      return;
    }
    
    if (data) {
      setBenefits(data);
      setShowBenefits(true);
    }
  };

  if (!user) {
    return <Login onLogin={setUser} />;
  }

  if (user.isAdmin) {
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