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
      // Look up user by email using RPC or direct auth query
      // Since we can't query auth.users directly from client, we'll use profiles
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, full_name')
        .ilike('id', `%${email}%`) // This won't work, we need a different approach
        .single();

      // Better approach: Use admin API or provide user_id directly
      // For now, let's use a workaround by checking if email exists in auth metadata
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      
      if (!currentUser) throw new Error('Not authenticated');

      // Since we cannot query auth.users from client, we need to inform user
      // to use SQL method or we need an edge function
      toast({
        title: 'Use SQL Method',
        description: 'Please use the SQL method below to grant admin access, as direct email lookup requires server-side access.',
        variant: 'destructive',
      });
      
      setLoading(false);
      return;

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
          <strong>Important:</strong> Due to security restrictions, admin access must be granted via SQL.
          Use the SQL method below in your Supabase dashboard.
        </AlertDescription>
      </Alert>

      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Grant Admin Access
          </CardTitle>
          <CardDescription>
            Follow the instructions below to grant administrator privileges to a user.
            Admin users will have full access to the admin panel and system management.
          </CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Method 1: SQL Editor (Recommended)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Open the Supabase SQL Editor and run the following query:
            </p>
            <pre className="bg-secondary/50 p-4 rounded-md text-sm overflow-x-auto border">
{`-- Replace 'user@example.com' with the actual user's email
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role
FROM auth.users
WHERE email = 'user@example.com'
ON CONFLICT (user_id, role) DO NOTHING;`}
            </pre>
          </div>
          
          <div className="flex items-start gap-2 p-3 bg-primary/10 rounded-md">
            <AlertCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
            <p className="text-sm">
              Replace <code className="px-1 py-0.5 bg-background rounded">user@example.com</code> with the email address of the user you want to make an admin.
            </p>
          </div>

          <Button 
            onClick={() => window.open('https://supabase.com/dashboard/project/tktjjxgxvzzvgnmeodqg/sql/new', '_blank')}
            className="w-full"
          >
            Open SQL Editor
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Method 2: Verify Admin Access</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            After granting admin access, verify it with this query:
          </p>
          <pre className="bg-secondary/50 p-4 rounded-md text-sm overflow-x-auto border">
{`-- Check who has admin access
SELECT 
  u.email,
  p.full_name,
  ur.role,
  ur.created_at as admin_since
FROM public.user_roles ur
JOIN auth.users u ON ur.user_id = u.id
LEFT JOIN public.profiles p ON u.id = p.id
WHERE ur.role = 'admin'
ORDER BY ur.created_at DESC;`}
          </pre>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Method 3: Revoke Admin Access</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            To remove admin privileges from a user:
          </p>
          <pre className="bg-secondary/50 p-4 rounded-md text-sm overflow-x-auto border">
{`-- Replace 'user@example.com' with the actual email
DELETE FROM public.user_roles
WHERE user_id = (
  SELECT id FROM auth.users 
  WHERE email = 'user@example.com'
)
AND role = 'admin';`}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}
