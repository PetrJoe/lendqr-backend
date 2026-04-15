import axios from 'axios';
import { env } from '../../config/env';
import { Errors } from '../../shared/errors/AppError';
import type { KarmaCheckResult } from './adjutor.types';

const client = axios.create({
  baseURL: env.adjutor.baseUrl,
  timeout: env.adjutor.timeoutMs,
  headers: { Authorization: `Bearer ${env.adjutor.apiKey}` },
});

export async function checkKarmaBlacklist(identity: string): Promise<KarmaCheckResult> {
  try {
    const { data } = await client.get(`/verification/karma/${encodeURIComponent(identity)}`);
    // Adjutor returns data.data = null when not blacklisted, or an object when blacklisted
    const isBlacklisted = data?.data !== null && data?.data !== undefined;
    return { isBlacklisted, raw: data };
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      // 404 from Adjutor means identity not found on blacklist
      if (err.response?.status === 404) {
        return { isBlacklisted: false, raw: err.response.data };
      }
    }
    throw Errors.externalFailure('Karma blacklist check failed. Please try again later.');
  }
}
