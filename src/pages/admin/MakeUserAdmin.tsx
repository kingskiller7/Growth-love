import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Shield, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function MakeUserAdmin() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleMakeAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // First, get the user ID from the email via profiles table
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', (await supabase.auth.getUser()).data.user?.id || '')
        .single();

      if (profileError) throw new Error('User not found');

      // Check if user already has admin role
      const { data: existingRole } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', profile.id)
        .eq('role', 'admin')
        .single();

      if (existingRole) {
        toast({
          title: 'Already an admin',
          description: 'This user already has admin privileges',
        });
        setLoading(false);
        return;
      }

      // Add admin role
      const { error: insertError } = await supabase
        .from('user_roles')
        .insert({
          user_id: profile.id,
          role: 'admin',
        });

      if (insertError) throw insertError;

      toast({
        title: 'Success!',
        description: 'Admin role granted successfully',
      });
      
      setEmail('');
      setTimeout(() => {
        navigate('/admin');
      }, 1500);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to grant admin role',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-2xl space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/admin')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-3xl font-bold">Grant Admin Access</h1>
      </div>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Security Notice:</strong> This page should only be accessible to super administrators.
          Granting admin privileges gives users full system access.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Make User Admin
          </CardTitle>
          <CardDescription>
            Enter a user's email to grant them administrator privileges. This will allow them to access
            the admin panel and manage the system.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleMakeAdmin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">User Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="user@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <p className="text-sm text-muted-foreground">
                The user must already have an account in the system
              </p>
            </div>
            
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? 'Granting access...' : 'Grant Admin Access'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle className="text-base">Alternative: SQL Method</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            You can also grant admin access using SQL in the Supabase dashboard:
          </p>
          <pre className="bg-background p-3 rounded-md text-xs overflow-x-auto">
{`-- Replace 'user@example.com' with the actual email
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role
FROM auth.users
WHERE email = 'user@example.com'
ON CONFLICT DO NOTHING;`}
          </pre>
          <p className="text-sm text-muted-foreground">
            Run this in the SQL Editor of your Supabase dashboard.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
