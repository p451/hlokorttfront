import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Alert, AlertDescription } from './ui/alert';
import { User } from 'lucide-react';
import { Employee } from '../types';

interface LoginProps {
  onLogin: (user: Employee) => void;
}

interface FormData {
  username: string;
  password: string;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
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
      onLogin(data);
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