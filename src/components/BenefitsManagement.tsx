import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Alert, AlertDescription } from './ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Plus, Trash2, Edit2, Save, X } from 'lucide-react';
import { Benefit, MembershipLevel } from '../types';
import ConfirmationDialog from './ui/confirmation-dialog';

interface NewBenefitData {
  level: MembershipLevel;
  title: string;
  description: string;
  validUntil: string;
}

const BenefitsManagement: React.FC = () => {
  const [benefits, setBenefits] = useState<Benefit[]>([]);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState<MembershipLevel>('BRONZE');
  const [editingBenefit, setEditingBenefit] = useState<Benefit | null>(null);
  const [newBenefit, setNewBenefit] = useState<NewBenefitData>({
    level: 'BRONZE',
    title: '',
    description: '',
    validUntil: ''
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
    fetchBenefits();
  }, []);

  const fetchBenefits = async () => {
    setIsLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/admin/benefits`, {
        credentials: 'include',
        headers: {
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
          errorMessage = errorText || 'Failed to fetch benefits';
        }
        setError(errorMessage);
        return;
      }

      const data = await response.json();
      setBenefits(data);
    } catch (err) {
      setError('Network error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddBenefit = async (e: React.FormEvent) => {
    e.preventDefault();
    setConfirmDialog({
      isOpen: true,
      title: 'Vahvista lisäys',
      description: 'Oletko varma, että haluat lisätä uuden edun?',
      onConfirm: async () => {
        setIsLoading(true);
        try {
          const benefitToAdd = {
            ...newBenefit,
            level: selectedLevel
          };

          const response = await fetch(`${process.env.REACT_APP_API_URL}/api/admin/benefits`, {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            credentials: 'include',
            body: JSON.stringify(benefitToAdd)
          });

          if (!response.ok) {
            const errorText = await response.text();
            let errorMessage;
            try {
              const errorData = JSON.parse(errorText);
              errorMessage = errorData.error;
            } catch {
              errorMessage = errorText || 'Failed to add benefit';
            }
            setError(errorMessage);
            return;
          }

          setSuccess('Benefit added successfully');
          setShowAddForm(false);
          setNewBenefit({
            level: 'BRONZE',
            title: '',
            description: '',
            validUntil: ''
          });
          await fetchBenefits();
        } catch (err) {
          setError('Network error');
        } finally {
          setIsLoading(false);
        }
      }
    });
  };

  const handleUpdateBenefit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBenefit) return;

    setConfirmDialog({
      isOpen: true,
      title: 'Vahvista muutokset',
      description: 'Oletko varma, että haluat päivittää edun tiedot?',
      onConfirm: async () => {
        setIsLoading(true);
        try {
          const response = await fetch(`${process.env.REACT_APP_API_URL}/api/admin/benefits/${editingBenefit.id}`, {
            method: 'PUT',
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            credentials: 'include',
            body: JSON.stringify(editingBenefit)
          });

          if (!response.ok) {
            const errorText = await response.text();
            let errorMessage;
            try {
              const errorData = JSON.parse(errorText);
              errorMessage = errorData.error;
            } catch {
              errorMessage = errorText || 'Failed to update benefit';
            }
            setError(errorMessage);
            return;
          }

          setSuccess('Benefit updated successfully');
          setEditingBenefit(null);
          await fetchBenefits();
        } catch (err) {
          setError('Network error');
        } finally {
          setIsLoading(false);
        }
      }
    });
  };

  const handleDeleteBenefit = async (benefitId: number) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Vahvista poisto',
      description: 'Oletko varma, että haluat poistaa edun? Tätä toimintoa ei voi peruuttaa.',
      onConfirm: async () => {
        setIsLoading(true);
        try {
          const response = await fetch(`${process.env.REACT_APP_API_URL}/api/admin/benefits/${benefitId}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            credentials: 'include'
          });

          if (!response.ok) {
            const errorText = await response.text();
            let errorMessage;
            try {
              const errorData = JSON.parse(errorText);
              errorMessage = errorData.error;
            } catch {
              errorMessage = errorText || 'Failed to delete benefit';
            }
            setError(errorMessage);
            return;
          }

          setSuccess('Benefit deleted successfully');
          await fetchBenefits();
        } catch (err) {
          setError('Network error');
        } finally {
          setIsLoading(false);
        }
      }
    });
  };

  const filteredBenefits = benefits.filter(benefit => benefit.level === selectedLevel);

  return (
    <Card className="mb-8">
      <CardHeader className="flex flex-row items-center justify-between">
        <h2 className="text-xl font-semibold">Benefits Management</h2>
        <div className="flex space-x-4">
          <select
            className="rounded-md border border-input bg-background px-3 py-2"
            value={selectedLevel}
            onChange={e => setSelectedLevel(e.target.value as MembershipLevel)}
          >
            <option value="BRONZE">Bronze</option>
            <option value="SILVER">Silver</option>
            <option value="GOLD">Gold</option>
            <option value="PLATINUM">Platinum</option>
          </select>
          <Button 
            onClick={() => setShowAddForm(!showAddForm)}
            variant="default"
          >
            <Plus className="mr-2 h-4 w-4" />
            {showAddForm ? 'Cancel' : 'Add Benefit'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
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

        {showAddForm && (
          <form onSubmit={handleAddBenefit} className="grid grid-cols-2 gap-4 mb-6">
            <Input
              placeholder="Title"
              value={newBenefit.title}
              onChange={e => setNewBenefit({...newBenefit, title: e.target.value})}
              required
            />
            <Input
              type="date"
              placeholder="Valid Until"
              value={newBenefit.validUntil}
              onChange={e => setNewBenefit({...newBenefit, validUntil: e.target.value})}
              required
            />
            <textarea
              className="col-span-2 rounded-md border border-input bg-background px-3 py-2"
              placeholder="Description"
              value={newBenefit.description}
              onChange={e => setNewBenefit({...newBenefit, description: e.target.value})}
              required
              rows={3}
            />
            <Button 
              type="submit" 
              variant="default"
              disabled={isLoading}
              className="col-span-2"
            >
              Add Benefit
            </Button>
          </form>
        )}

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Valid Until</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredBenefits.map((benefit) => (
              <TableRow key={benefit.id}>
                <TableCell>
                  {editingBenefit?.id === benefit.id ? (
                    <Input
                      value={editingBenefit.title}
                      onChange={e => setEditingBenefit({...editingBenefit, title: e.target.value})}
                    />
                  ) : (
                    benefit.title
                  )}
                </TableCell>
                <TableCell>
                  {editingBenefit?.id === benefit.id ? (
                    <textarea
                      className="w-full rounded-md border border-input bg-background px-3 py-2"
                      value={editingBenefit.description}
                      onChange={e => setEditingBenefit({...editingBenefit, description: e.target.value})}
                      rows={2}
                    />
                  ) : (
                    benefit.description
                  )}
                </TableCell>
                <TableCell>
                  {editingBenefit?.id === benefit.id ? (
                    <Input
                      type="date"
                      value={editingBenefit.validUntil}
                      onChange={e => setEditingBenefit({...editingBenefit, validUntil: e.target.value})}
                    />
                  ) : (
                    benefit.validUntil
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    {editingBenefit?.id === benefit.id ? (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleUpdateBenefit}
                          disabled={isLoading}
                        >
                          <Save className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingBenefit(null)}
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
                          onClick={() => setEditingBenefit(benefit)}
                          disabled={isLoading}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteBenefit(benefit.id)}
                          disabled={isLoading}
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

      <ConfirmationDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        description={confirmDialog.description}
      />
    </Card>
  );
};

export default BenefitsManagement;