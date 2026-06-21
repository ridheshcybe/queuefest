'use client';
import {useRouter} from 'next/navigation';
import {useEffect} from 'next/navigation';
import LoginScreen from '../components/loginscreen';

export default function HomePage() {
  const router = useRouter();
  useEffect(()=>{
    router.replace('/dashboard');
  }, [router]);
  return null;
}