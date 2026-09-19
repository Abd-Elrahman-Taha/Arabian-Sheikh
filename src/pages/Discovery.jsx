import { useEffect } from 'react';
import { useRouter } from '../router/RouterContext';

export default function Discovery() {
  const { navigate } = useRouter();

  useEffect(() => {
    navigate('/shop', { replace: true });
  }, [navigate]);

  return null;
}
