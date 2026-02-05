import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { apiClient } from '@/shared/lib/api';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { useApp } from '@/shared/contexts/AppContext';

const AuthCallback = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { refreshUser } = useApp();
    const token = searchParams.get('token');

    useEffect(() => {
        const handleAuth = async () => {
            if (token) {
                try {
                    // Set token in API client (handles localStorage)
                    apiClient.setToken(token);

                    // Refresh global app state so Welcome page sees the user
                    await refreshUser();

                    toast.success('Successfully authenticated');

                    // Navigate to Welcome (Trajectory selector)
                    navigate('/welcome');
                } catch (error) {
                    console.error('Auth callback error:', error);
                    toast.error('Authentication failed. Please try again.');
                    navigate('/welcome'); // Changed from /login
                }
            } else {
                toast.error('No authentication token found.');
                navigate('/welcome'); // Changed from /login
            }
        };

        handleAuth();
    }, [token, navigate, refreshUser, searchParams]);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-background mesh-gradient-bg">
            <div className="text-center space-y-4">
                <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto" />
                <h2 className="text-2xl font-bold text-foreground">Finalizing Authentication...</h2>
                <p className="text-muted-foreground">Please wait while we set up your secure session.</p>
            </div>
        </div>
    );
};

export default AuthCallback;
