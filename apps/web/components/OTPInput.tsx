"use client";
import { useState } from 'react';

type Props = { length?: number; value: string; onChange: (val: string) => void };

export default function OTPInput({ length = 4, value, onChange }: Props) {
  return (
    <input
      className="w-full border rounded-lg p-3 text-lg tracking-widest text-center"
      placeholder={Array.from({ length }).map(() => '•').join('')}
      value={value}
      onChange={(e) => onChange(e.target.value.slice(0, length))}
    />
  );
}
