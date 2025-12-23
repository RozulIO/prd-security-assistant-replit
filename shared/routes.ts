import { z } from 'zod';
import { assessments, type RiskAssessmentItem } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  assessments: {
    upload: {
      method: 'POST' as const,
      path: '/api/assessments/upload',
      // Input is FormData, handled manually in route
      responses: {
        201: z.custom<typeof assessments.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/assessments/:id',
      responses: {
        200: z.custom<typeof assessments.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    list: {
      method: 'GET' as const,
      path: '/api/assessments',
      responses: {
        200: z.array(z.custom<typeof assessments.$inferSelect>()),
      },
    },
    analyze: {
      method: 'POST' as const,
      path: '/api/assessments/:id/analyze',
      responses: {
        200: z.array(z.custom<RiskAssessmentItem>()),
        404: errorSchemas.notFound,
      },
    },
    generateReport: {
      method: 'POST' as const,
      path: '/api/assessments/:id/report',
      responses: {
        200: z.object({ report: z.string() }),
        404: errorSchemas.notFound,
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
