import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Alert, AlertDescription } from './ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { RefreshCw, Trash2, LogOut, UserPlus, Edit2, Save, X } from 'lucide-react';
import { Employee, MembershipLevel } from '../types';
import ConfirmationDialog from './ui/confirmation-dialog';
import BenefitsManagement from './BenefitsManagement';
import PrivacyPolicyManagement from './PrivacyPolicyManagement';
import apiClient from '../apiClient';

const LogoSelector: React.FC<{
  currentLogo: string;
  onSelect: (logoUrl: string) => void;
}> = ({ currentLogo, onSelect }) => {
  const [availableLogos, setAvailableLogos] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    fetchLogos();
  }, []);

  const fetchLogos = async () => {
    const { data, error } = await apiClient.get<{ logos: string[] }>('/api/admin/available-logos');
    
    if (error) {
      setUploadError(error);
      return;
    }
    
    if (data) {
      setAvailableLogos(data.logos || []);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('file', file);
    
    setIsLoading(true);
    setUploadError('');

    const { data, error } = await apiClient.upload<{ logoUrl: string }>('/api/admin/upload-logo', formData);
    
    if (error) {
      setUploadError(error);
      setIsLoading(false);
      return;
    }
    
    if (data) {
      onSelect(data.logoUrl);
      await fetchLogos();
      setIsExpanded(true);
    }
    
    setIsLoading(false);
  };

  return (
    <div className="relative">
      <div className="flex items-center gap-4 mb-2">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => document.getElementById('logo-upload')?.click()}
          disabled={isLoading}
        >
          {isLoading ? 'Uploading...' : 'Upload New Logo'}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? 'Hide Logos' : 'Show Available Logos'}
        </Button>
        <input
          type="file"
          id="logo-upload"
          className="hidden"
          accept="image/*"
          onChange={handleLogoUpload}
          disabled={isLoading}
        />
      </div>

      {uploadError && (
        <Alert variant="destructive" className="mb-2">
          <AlertDescription>{uploadError}</AlertDescription>
        </Alert>
      )}

      {isExpanded && (
        <Card className="absolute left-0 top-full z-50 w-[500px] mt-2 bg-white shadow-lg">
          <CardContent className="p-4">
            <div className="grid grid-cols-3 gap-4">
              {availableLogos.map((logo) => (
                <div
                  key={logo}
                  className={`relative p-2 border rounded-lg cursor-pointer transition-all hover:border-primary hover:shadow-md
                    ${currentLogo === logo ? 'border-primary bg-primary/5' : 'border-border'}`}
                  onClick={() => {
                    onSelect(logo);
                    setIsExpanded(false);
                  }}
                >
                  <img
                    src={logo}
                    alt="Logo option"
                    className="w-full h-24 object-contain"
                  />
                </div>
              ))}
              {availableLogos.length === 0 && (
                <div className="col-span-3 text-center py-8 text-muted-foreground">
                  No logos available. Upload one to get started.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="mt-2">
        <p className="text-sm text-muted-foreground mb-1">Current Logo:</p>
        <img 
          src={currentLogo} 
          alt="Current logo" 
          className="w-20 h-20 object-contain border rounded-lg p-2"
        />
      </div>
    </div>
  );
};

interface NewEmployeeData {
  username: string;
  name: string;
  company: string;
  email: string;
  membershipLevel: MembershipLevel;
  validUntil: string;
  startDate: string;
  password: string;
}

interface EditingEmployee extends Employee {
  password?: string;
}

const AdminPanel: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<EditingEmployee | null>(null);
  
  const [newEmployee, setNewEmployee] = useState<NewEmployeeData>({
    username: '',
    name: '',
    company: '',
    email: '',
    membershipLevel: 'BRONZE',
    validUntil: '',
    startDate: '',
    password: ''
  });

  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    description: '',
    onConfirm: () => {}
  });

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    setIsLoading(true);
    setError('');
    const { data, error } = await apiClient.get<Employee[]>('/api/admin/employees');
    
    if (error) {
      setError(error);
      setIsLoading(false);
      return;
    }
    
    if (data) {
      setEmployees(data);
    }
    
    setIsLoading(false);
  };

  const handleEditEmployee = (employee: Employee) => {
    // Luodaan kopio työntekijän tiedoista editointia varten
    setEditingEmployee({ 
      ...employee,
      // Varmistetaan että kaikki tarvittavat kentät ovat mukana
      logoUrl: employee.logoUrl || '/api/placeholder/100/100',
      profileImage: employee.profileImage || '/api/placeholder/400/400',
      membershipLevel: employee.membershipLevel || 'BRONZE'
    });
  };

  const handleAddEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    setConfirmDialog({
      isOpen: true,
      title: 'Vahvista lisäys',
      description: 'Oletko varma, että haluat lisätä uuden työntekijän?',
      onConfirm: async () => {
        setIsLoading(true);
        const { data, error } = await apiClient.post('/api/admin/employees', newEmployee);
        
        if (error) {
          setError(error);
          setIsLoading(false);
          return;
        }
        
        if (data) {
          setSuccess('Employee added successfully');
          setShowAddForm(false);
          setNewEmployee({
            username: '',
            name: '',
            company: '',
            email: '',
            membershipLevel: 'BRONZE',
            validUntil: '',
            startDate: '',
            password: ''
          });
          await fetchEmployees();
        }
        
        setIsLoading(false);
      }
    });
  };

  const handleSaveEmployee = async () => {
    if (!editingEmployee) return;
  
    setConfirmDialog({
      isOpen: true,
      title: 'Vahvista muutokset',
      description: 'Oletko varma, että haluat tallentaa muutokset työntekijän tietoihin?',
      onConfirm: async () => {
        setIsLoading(true);
        const { data, error } = await apiClient.put(`/api/admin/employees/${editingEmployee.id}`, {
          name: editingEmployee.name,
          company: editingEmployee.company,
          email: editingEmployee.email,
          membershipLevel: editingEmployee.membershipLevel,
          validUntil: editingEmployee.validUntil,
          startDate: editingEmployee.startDate,
          logoUrl: editingEmployee.logoUrl
        });
        
        if (error) {
          setError(error);
          setIsLoading(false);
          return;
        }
        
        if (data) {
          setSuccess('Employee updated successfully');
          setEditingEmployee(null);
          await fetchEmployees();
        }
        
        setIsLoading(false);
      }
    });
  };

  const handleResetPassword = async (userId: number) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Vahvista salasanan nollaus',
      description: 'Oletko varma, että haluat nollata työntekijän salasanan?',
      onConfirm: async () => {
        const newPassword = window.prompt('Anna uusi salasana:');
        if (!newPassword) return;

        setIsLoading(true);
        const { data, error } = await apiClient.post('/api/admin/reset-password', { userId, newPassword });
        
        if (error) {
          setError(error);
          setIsLoading(false);
          return;
        }
        
        if (data) {
          setSuccess('Password reset successfully');
        }
        
        setIsLoading(false);
      }
    });
  };

  const handleDeleteEmployee = async (userId: number) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Vahvista poisto',
      description: 'Oletko varma, että haluat poistaa työntekijän? Tätä toimintoa ei voi peruuttaa.',
      onConfirm: async () => {
        setIsLoading(true);
        const { data, error } = await apiClient.delete(`/api/admin/employees/${userId}`);
        
        if (error) {
          setError(error);
          setIsLoading(false);
          return;
        }
        
        if (data) {
          setSuccess('Employee deleted successfully');
          await fetchEmployees();
        }
        
        setIsLoading(false);
      }
    });
  };

  const handleLogout = async () => {
    const { data, error } = await apiClient.post('/api/logout');
    
    if (error) {
      setError('Logout failed');
      return;
    }
    
    if (data) {
      window.location.href = '/';
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Admin Panel</h1>
        <Button onClick={handleLogout} variant="outline">
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="mb-4">
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      <Card className="mb-8">
        <CardHeader className="flex flex-row items-center justify-between">
          <h2 className="text-xl font-semibold">Employee Management</h2>
          <Button 
            onClick={() => setShowAddForm(!showAddForm)}
            variant="default"
          >
            <UserPlus className="mr-2 h-4 w-4" />
            {showAddForm ? 'Cancel' : 'Add Employee'}
          </Button>
        </CardHeader>
        <CardContent>
          {showAddForm && (
            <form onSubmit={handleAddEmployee} className="grid grid-cols-2 gap-4 mb-6">
              <Input
                placeholder="Username"
                value={newEmployee.username}
                onChange={e => setNewEmployee({...newEmployee, username: e.target.value})}
                required
              />
              <Input
                placeholder="Password"
                type="password"
                value={newEmployee.password}
                onChange={e => setNewEmployee({...newEmployee, password: e.target.value})}
                required
              />
              <Input
                placeholder="Name"
                value={newEmployee.name}
                onChange={e => setNewEmployee({...newEmployee, name: e.target.value})}
                required
              />
              <Input
                placeholder="Email"
                type="email"
                value={newEmployee.email}
                onChange={e => setNewEmployee({...newEmployee, email: e.target.value})}
                required
              />
              <Input
                placeholder="Company"
                value={newEmployee.company}
                onChange={e => setNewEmployee({...newEmployee, company: e.target.value})}
                required
              />
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2"
                value={newEmployee.membershipLevel}
                onChange={e => setNewEmployee({...newEmployee, membershipLevel: e.target.value as MembershipLevel})}
                required
              >
                <option value="BRONZE">Bronze</option>
                <option value="SILVER">Silver</option>
                <option value="GOLD">Gold</option>
                <option value="PLATINUM">Platinum</option>
              </select>
              <Input
                type="date"
                placeholder="Start Date"
                value={newEmployee.startDate}
                onChange={e => setNewEmployee({...newEmployee, startDate: e.target.value})}
                required
              />
              <Input
                type="date"
                placeholder="Valid Until"
                value={newEmployee.validUntil}
                onChange={e => setNewEmployee({...newEmployee, validUntil: e.target.value})}
                required
              />
              <Button 
                type="submit" 
                variant="default"
                disabled={isLoading}
                className="col-span-2"
              >
                Add Employee
              </Button>
            </form>
          )}

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Logo</TableHead>
                <TableHead>Username</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>Valid Until</TableHead>
                <TableHead>Level</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees.map((employee) => (
                <TableRow key={employee.id}>
                  <TableCell>
                    {editingEmployee?.id === employee.id ? (
                      <LogoSelector
                        currentLogo={editingEmployee.logoUrl || '/api/placeholder/100/100'}
                        onSelect={(logoUrl) => setEditingEmployee({...editingEmployee, logoUrl})}
                      />
                    ) : (
                      <img 
                        src={employee.logoUrl || '/api/placeholder/100/100'} 
                        alt="Company logo" 
                        className="w-12 h-12 object-contain"
                      />
                    )}
                  </TableCell>
                  <TableCell>{employee.username}</TableCell>
                  <TableCell>
                    {editingEmployee?.id === employee.id ? (
                      <Input
                        value={editingEmployee.name}
                        onChange={e => setEditingEmployee({...editingEmployee, name: e.target.value})}
                      />
                    ) : (
                      employee.name
                    )}
                  </TableCell>
                  <TableCell>
                    {editingEmployee?.id === employee.id ? (
                      <Input
                        value={editingEmployee.email}
                        onChange={e => setEditingEmployee({...editingEmployee, email: e.target.value})}
                      />
                    ) : (
                      employee.email
                    )}
                  </TableCell>
                  <TableCell>
                    {editingEmployee?.id === employee.id ? (
                      <Input
                        value={editingEmployee.company}
                        onChange={e => setEditingEmployee({...editingEmployee, company: e.target.value})}
                      />
                    ) : (
                      employee.company
                    )}
                  </TableCell>
                  <TableCell>
                    {editingEmployee?.id === employee.id ? (
                      <Input
                        type="date"
                        value={editingEmployee.startDate}
                        onChange={e => setEditingEmployee({...editingEmployee, startDate: e.target.value})}
                      />
                    ) : (
                      employee.startDate
                    )}
                  </TableCell>
                  <TableCell>
                    {editingEmployee?.id === employee.id ? (
                      <Input
                        type="date"
                        value={editingEmployee.validUntil}
                        onChange={e => setEditingEmployee({...editingEmployee, validUntil: e.target.value})}
                      />
                    ) : (
                      employee.validUntil
                    )}
                  </TableCell>
                  <TableCell>
                    {editingEmployee?.id === employee.id ? (
                      <select
                        className="rounded-md border border-input bg-background px-2 py-1"
                        value={editingEmployee.membershipLevel}
                        onChange={e => setEditingEmployee({...editingEmployee, membershipLevel: e.target.value as MembershipLevel})}
                      >
                        <option value="BRONZE">Bronze</option>
                        <option value="SILVER">Silver</option>
                        <option value="GOLD">Gold</option>
                        <option value="PLATINUM">Platinum</option>
                      </select>
                    ) : (
                      <span className={`px-2 py-1 rounded-md inline-block ${
                        employee.membershipLevel === 'GOLD' ? 'bg-yellow-100 text-yellow-800' :
                        employee.membershipLevel === 'SILVER' ? 'bg-gray-100 text-gray-800' :
                        employee.membershipLevel === 'BRONZE' ? 'bg-orange-100 text-orange-800' :
                        employee.membershipLevel === 'PLATINUM' ? 'bg-gray-900 text-white' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {employee.membershipLevel || 'BRONZE'}
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      {editingEmployee?.id === employee.id ? (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleSaveEmployee}
                            disabled={isLoading}
                          >
                            <Save className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingEmployee(null)}
                            disabled={isLoading}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditEmployee(employee)}
                            disabled={isLoading}
                            title="Edit employee"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleResetPassword(employee.id)}
                            disabled={isLoading}
                            title="Reset password"
                          >
                            <RefreshCw className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteEmployee(employee.id)}
                            disabled={isLoading}
                            title="Delete employee"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <BenefitsManagement />
      <PrivacyPolicyManagement />

      <ConfirmationDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        description={confirmDialog.description}
      />
    </div>
  );
};

export default AdminPanel;