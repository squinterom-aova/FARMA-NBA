import { TwitterApi } from 'twitter-api-v2';
import axios from 'axios';
import { SenalExterna, FuenteSenal, Sentimiento } from '@/types';
import { DataProcessor } from './DataProcessor';

export class SocialMediaMonitor {
  private twitterClient: TwitterApi;
  private dataProcessor: DataProcessor;
  private isRunning: boolean = false;

  constructor() {
    this.twitterClient = new TwitterApi({
      appKey: process.env.TWITTER_API_KEY || '',
      appSecret: process.env.TWITTER_API_SECRET || '',
      accessToken: process.env.TWITTER_ACCESS_TOKEN || '',
      accessSecret: process.env.TWITTER_ACCESS_SECRET || '',
    });
    
    this.dataProcessor = new DataProcessor();
  }

  /**
   * Inicia el monitoreo continuo de redes sociales
   */
  async iniciarMonitoreo(): Promise<void> {
    if (this.isRunning) {
      console.log('Monitoreo ya está ejecutándose');
      return;
    }

    this.isRunning = true;
    console.log('Iniciando monitoreo de redes sociales...');

    // Monitoreo de Twitter
    this.monitorearTwitter();
    
    // Monitoreo de LinkedIn
    this.monitorearLinkedIn();
    
    // Monitoreo de foros médicos
    this.monitorearForosMedicos();
  }

  /**
   * Detiene el monitoreo
   */
  detenerMonitoreo(): void {
    this.isRunning = false;
    console.log('Monitoreo detenido');
  }

  /**
   * Monitorea Twitter/X para contenido médico relevante
   */
  private async monitorearTwitter(): Promise<void> {
    if (!this.isRunning) return;

    try {
      const terminosMedicos = [
        'diabetes', 'hipertensión', 'cáncer', 'cardiología', 'neurología',
        'pediatría', 'ginecología', 'dermatología', 'psiquiatría', 'oncología',
        'medicamento', 'tratamiento', 'paciente', 'médico', 'doctor'
      ];

      for (const termino of terminosMedicos) {
        const tweets = await this.twitterClient.v2.search(`${termino} lang:es`);
        
        for await (const tweet of tweets) {
          if (!this.isRunning) break;
          
          const senal = await this.dataProcessor.procesarSenalExterna(
            tweet.text,
            FuenteSenal.TWITTER,
            tweet.author_id || 'anónimo'
          );

          if (senal.relevancia >= 7) {
            await this.guardarSenal(senal);
          }
        }

        // Esperar entre búsquedas para evitar rate limits
        await this.delay(1000);
      }
    } catch (error) {
      console.error('Error monitoreando Twitter:', error);
    }

    // Programar siguiente ejecución
    setTimeout(() => this.monitorearTwitter(), 5 * 60 * 1000); // 5 minutos
  }

  /**
   * Monitorea LinkedIn para contenido profesional médico
   */
  private async monitorearLinkedIn(): Promise<void> {
    if (!this.isRunning) return;

    try {
      // Simulación de monitoreo de LinkedIn
      // En producción, usaría la API oficial de LinkedIn
      const posts = await this.obtenerPostsLinkedIn();
      
      for (const post of posts) {
        if (!this.isRunning) break;
        
        const senal = await this.dataProcessor.procesarSenalExterna(
          post.contenido,
          FuenteSenal.LINKEDIN,
          post.autor
        );

        if (senal.relevancia >= 6) {
          await this.guardarSenal(senal);
        }
      }
    } catch (error) {
      console.error('Error monitoreando LinkedIn:', error);
    }

    // Programar siguiente ejecución
    setTimeout(() => this.monitorearLinkedIn(), 10 * 60 * 1000); // 10 minutos
  }

  /**
   * Monitorea foros médicos especializados
   */
  private async monitorearForosMedicos(): Promise<void> {
    if (!this.isRunning) return;

    try {
      const foros = [
        'https://www.medscape.com/spanish',
        'https://www.reddit.com/r/medicine',
        'https://www.reddit.com/r/medicalschool'
      ];

      for (const foro of foros) {
        if (!this.isRunning) break;
        
        const posts = await this.obtenerPostsForo(foro);
        
        for (const post of posts) {
          const senal = await this.dataProcessor.procesarSenalExterna(
            post.contenido,
            FuenteSenal.FORO_MEDICO,
            post.autor
          );

          if (senal.relevancia >= 8) {
            await this.guardarSenal(senal);
          }
        }

        await this.delay(2000);
      }
    } catch (error) {
      console.error('Error monitoreando foros médicos:', error);
    }

    // Programar siguiente ejecución
    setTimeout(() => this.monitorearForosMedicos(), 15 * 60 * 1000); // 15 minutos
  }

  /**
   * Busca contenido específico por términos médicos
   */
  async buscarContenidoEspecifico(terminos: string[]): Promise<SenalExterna[]> {
    const senales: SenalExterna[] = [];

    try {
      for (const termino of terminos) {
        // Búsqueda en Twitter
        const tweets = await this.twitterClient.v2.search(`${termino} lang:es`);
        
        for await (const tweet of tweets) {
          const senal = await this.dataProcessor.procesarSenalExterna(
            tweet.text,
            FuenteSenal.TWITTER,
            tweet.author_id || 'anónimo'
          );

          if (senal.relevancia >= 5) {
            senales.push(senal);
          }
        }

        await this.delay(1000);
      }
    } catch (error) {
      console.error('Error en búsqueda específica:', error);
    }

    return senales;
  }

  /**
   * Analiza tendencias en redes sociales
   */
  async analizarTendencias(): Promise<{
    temasPopulares: Array<{tema: string, frecuencia: number}>;
    sentimientos: {positivo: number, neutro: number, negativo: number};
    productosMencionados: Array<{producto: string, frecuencia: number}>;
  }> {
    try {
      // Obtener señales de las últimas 24 horas
      const senales = await this.obtenerSenalesRecientes(24);
      
      // Analizar temas populares
      const temasCount: {[key: string]: number} = {};
      senales.forEach(senal => {
        senal.temas.forEach(tema => {
          temasCount[tema] = (temasCount[tema] || 0) + 1;
        });
      });

      const temasPopulares = Object.entries(temasCount)
        .map(([tema, frecuencia]) => ({ tema, frecuencia }))
        .sort((a, b) => b.frecuencia - a.frecuencia)
        .slice(0, 10);

      // Analizar sentimientos
      const sentimientos = {
        positivo: senales.filter(s => s.sentimiento === Sentimiento.POSITIVO).length,
        neutro: senales.filter(s => s.sentimiento === Sentimiento.NEUTRO).length,
        negativo: senales.filter(s => s.sentimiento === Sentimiento.NEGATIVO).length
      };

      // Analizar productos mencionados
      const productosCount: {[key: string]: number} = {};
      senales.forEach(senal => {
        senal.productosMencionados.forEach(producto => {
          productosCount[producto] = (productosCount[producto] || 0) + 1;
        });
      });

      const productosMencionados = Object.entries(productosCount)
        .map(([producto, frecuencia]) => ({ producto, frecuencia }))
        .sort((a, b) => b.frecuencia - a.frecuencia)
        .slice(0, 10);

      return {
        temasPopulares,
        sentimientos,
        productosMencionados
      };
    } catch (error) {
      console.error('Error analizando tendencias:', error);
      throw error;
    }
  }

  /**
   * Obtiene alertas de contenido crítico
   */
  async obtenerAlertas(): Promise<SenalExterna[]> {
    try {
      const senales = await this.obtenerSenalesRecientes(1); // Última hora
      
      return senales.filter(senal => 
        senal.sentimiento === Sentimiento.NEGATIVO && 
        senal.relevancia >= 8
      );
    } catch (error) {
      console.error('Error obteniendo alertas:', error);
      return [];
    }
  }

  // Métodos auxiliares simulados
  private async obtenerPostsLinkedIn(): Promise<Array<{contenido: string, autor: string}>> {
    // Simulación - en producción usaría la API de LinkedIn
    return [
      {
        contenido: 'Nuevo estudio sobre diabetes tipo 2 muestra resultados prometedores',
        autor: 'Dr. García'
      },
      {
        contenido: 'Importante avance en el tratamiento de hipertensión arterial',
        autor: 'Dra. Martínez'
      }
    ];
  }

  private async obtenerPostsForo(foro: string): Promise<Array<{contenido: string, autor: string}>> {
    // Simulación - en producción haría scraping o usaría APIs
    return [
      {
        contenido: 'Experiencias con nuevos medicamentos para diabetes',
        autor: 'Médico_Interno'
      },
      {
        contenido: 'Discusión sobre efectos secundarios de tratamientos oncológicos',
        autor: 'Oncólogo_Experto'
      }
    ];
  }

  private async guardarSenal(senal: SenalExterna): Promise<void> {
    // En producción, guardaría en base de datos
    console.log('Señal guardada:', {
      fuente: senal.fuente,
      relevancia: senal.relevancia,
      sentimiento: senal.sentimiento,
      temas: senal.temas
    });
  }

  private async obtenerSenalesRecientes(horas: number): Promise<SenalExterna[]> {
    // Simulación - en producción consultaría la base de datos
    return [];
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
} 