'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Heart, ArrowLeft, Home } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface WeddingNotFoundProps {
  weddingId?: string;
}

export default function WeddingNotFound({ weddingId }: WeddingNotFoundProps) {
  const router = useRouter();

  const handleGoHome = () => {
    router.push('/');
  };

  const handleGoBack = () => {
    router.back();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Icono decorativo */}
          <motion.div
            className="mx-auto w-20 h-20 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center mb-8"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Heart className="w-10 h-10 text-white" />
          </motion.div>

          {/* Título */}
          <motion.h1
            className="text-3xl font-heading font-light text-stone-700 mb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            Boda no encontrada
          </motion.h1>

          {/* Mensaje */}
          <motion.div
            className="space-y-3 mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <p className="text-gray-600 font-body">
              Lo sentimos, no pudimos encontrar la boda que buscas.
            </p>
            {weddingId && (
              <p className="text-sm text-gray-500 font-body">
                ID: <span className="font-mono bg-gray-100 px-2 py-1 rounded">{weddingId}</span>
              </p>
            )}
            <p className="text-sm text-gray-500 font-body">
              Verifica que el enlace sea correcto o contacta con los novios.
            </p>
          </motion.div>

          {/* Botones */}
          <motion.div
            className="flex flex-col sm:flex-row gap-3 justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <button
              onClick={handleGoBack}
              className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-body"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Regresar
            </button>
            
            <button
              onClick={handleGoHome}
              className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-primary to-secondary text-white rounded-lg hover:from-primary/90 hover:to-secondary/90 transition-all font-body"
            >
              <Home className="w-4 h-4 mr-2" />
              Ir al inicio
            </button>
          </motion.div>

          {/* Elemento decorativo */}
          <motion.div
            className="flex items-center justify-center space-x-3 mt-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <div className="w-12 h-0.5 bg-accent/30"></div>
            <div className="w-2 h-2 bg-accent/50 rounded-full"></div>
            <div className="w-12 h-0.5 bg-accent/30"></div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
