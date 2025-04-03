

"use client"
import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import HomeComponent from "@/app/components/HomeComponent"

// const HomeComponent = dynamic(() => import('./HomeComponent'), { suspense: true });

export default function Home() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HomeComponent />
    </Suspense>
  );
}