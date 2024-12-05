// Luo uusi tiedosto: src/components/PrivacyPolicyManagement.tsx

import React, { useState } from 'react';
import { Card, CardHeader, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import { Save } from 'lucide-react';
import ConfirmationDialog from './ui/confirmation-dialog';

const PrivacyPolicyManagement: React.FC = () => {
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const handleUpdatePrivacyPolicy = async () => {
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/admin/privacy-policy', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ content })
      });

      if (!response.ok) {
        throw new Error('Failed to update privacy policy');
      }

      setSuccess('Privacy policy updated successfully');
      setShowConfirmDialog(false);
    } catch (err) {
      setError('Failed to update privacy policy');
      console.error('Error updating privacy policy:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="mb-8">
      <CardHeader>
        <h2 className="text-xl font-semibold">Privacy Policy Management</h2>
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

        <div className="space-y-4">
          <textarea
            className="w-full min-h-[300px] p-4 rounded-md border"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Enter privacy policy content (HTML supported)"
          />

          <Button
            onClick={() => setShowConfirmDialog(true)}
            disabled={isLoading || !content}
            className="w-full"
          >
            <Save className="mr-2 h-4 w-4" />
            Update Privacy Policy
          </Button>
        </div>

        <ConfirmationDialog
          isOpen={showConfirmDialog}
          onClose={() => setShowConfirmDialog(false)}
          onConfirm={handleUpdatePrivacyPolicy}
          title="Confirm Update"
          description="Are you sure you want to update the privacy policy? This will create a new version."
        />
      </CardContent>
    </Card>
  );
};

export default PrivacyPolicyManagement;