import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    permissions: string[];
  };
}

/**
 * Middleware de autenticación JWT
 */
export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    res.status(401).json({
      success: false,
      error: 'Token de acceso requerido'
    });
    return;
  }

  try {
    const secret = process.env.JWT_SECRET || 'default-secret';
    const decoded = jwt.verify(token, secret) as any;
    
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
      permissions: decoded.permissions || []
    };
    
    next();
  } catch (error) {
    res.status(403).json({
      success: false,
      error: 'Token inválido o expirado'
    });
  }
};

/**
 * Middleware de autorización por roles
 */
export const authorizeRole = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Usuario no autenticado'
      });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        error: 'Acceso denegado: permisos insuficientes'
      });
      return;
    }

    next();
  };
};

/**
 * Middleware de autorización por permisos específicos
 */
export const authorizePermission = (permissions: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Usuario no autenticado'
      });
      return;
    }

    const hasPermission = permissions.some(permission => 
      req.user!.permissions.includes(permission)
    );

    if (!hasPermission) {
      res.status(403).json({
        success: false,
        error: 'Acceso denegado: permisos insuficientes'
      });
      return;
    }

    next();
  };
};

/**
 * Middleware para verificar si el usuario es propietario del recurso
 */
export const authorizeOwner = (resourceField: string = 'userId') => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Usuario no autenticado'
      });
      return;
    }

    // Permitir acceso si es admin
    if (req.user.role === 'admin') {
      next();
      return;
    }

    // Verificar si el usuario es propietario del recurso
    const resourceUserId = (req.params as any)[resourceField] || (req.body as any)[resourceField];
    
    if (resourceUserId && resourceUserId !== req.user.id) {
      res.status(403).json({
        success: false,
        error: 'Acceso denegado: no es propietario del recurso'
      });
      return;
    }

    next();
  };
};

/**
 * Middleware para rate limiting básico
 */
export const rateLimit = (maxRequests: number = 100, windowMs: number = 15 * 60 * 1000) => {
  const requests = new Map<string, { count: number; resetTime: number }>();

  return (req: Request, res: Response, next: NextFunction): void => {
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    const now = Date.now();

    const userRequests = requests.get(ip);
    
    if (!userRequests || now > userRequests.resetTime) {
      requests.set(ip, { count: 1, resetTime: now + windowMs });
    } else {
      userRequests.count++;
      
      if (userRequests.count > maxRequests) {
        res.status(429).json({
          success: false,
          error: 'Demasiadas solicitudes. Intente más tarde.'
        });
        return;
      }
    }

    next();
  };
};

/**
 * Middleware para validación de entrada básica
 */
export const validateInput = (schema: any) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const { error } = schema.validate(req.body);
      
      if (error) {
        res.status(400).json({
          success: false,
          error: 'Datos de entrada inválidos',
          detalles: error.details.map((detail: any) => detail.message)
        });
        return;
      }

      next();
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Error en validación de entrada'
      });
    }
  };
};

/**
 * Middleware para logging de requests
 */
export const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`);
  });

  next();
};

/**
 * Middleware para manejo de errores
 */
export const errorHandler = (error: any, req: Request, res: Response, next: NextFunction): void => {
  console.error('Error:', error);

  if (error.name === 'ValidationError') {
    res.status(400).json({
      success: false,
      error: 'Error de validación',
      detalles: error.message
    });
    return;
  }

  if (error.name === 'UnauthorizedError') {
    res.status(401).json({
      success: false,
      error: 'No autorizado'
    });
    return;
  }

  res.status(500).json({
    success: false,
    error: 'Error interno del servidor'
  });
}; 