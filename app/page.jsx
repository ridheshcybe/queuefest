'use client';

import LoginScreen from '../components/loginscreen';

export default function HomePage() {
  const router = useRouter();
  useEffect(()=>{
    router.replace('/dashboard');
  }, [router]);
  return null;
}