import { Router, Request, Response } from 'express';
import { validate } from './deps';
import { sendOtpSchema, verifyOtpSchema, checkLocationSchema, registerPasswordSchema, loginPasswordSchema } from '../schemas/auth';
import * as authService from '../services/auth_service';

const router = Router();

router.post('/send-otp', validate(sendOtpSchema), async (req: Request, res: Response) => {
  const result = await authService.sendOtp(req.body.phone);
  res.json(result);
});

router.post('/verify-otp', validate(verifyOtpSchema), async (req: Request, res: Response) => {
  try {
    const result = await authService.verifyOtp(req.body.phone, req.body.otp);
    res.json(result);
  } catch (e: unknown) {
    res.status(400).json({ success: false, message: (e as Error).message });
  }
});

router.post('/check-location', validate(checkLocationSchema), async (req: Request, res: Response) => {
  const result = await authService.checkLocation(req.body.location);
  res.json(result);
});

router.post('/register-password', validate(registerPasswordSchema), async (req: Request, res: Response) => {
  try {
    const { phone, name, age, password } = req.body;
    const result = await authService.registerWithPassword(phone, name, age, password);
    res.json(result);
  } catch (e: unknown) {
    res.status(400).json({ success: false, message: (e as Error).message });
  }
});

router.post('/login-password', validate(loginPasswordSchema), async (req: Request, res: Response) => {
  try {
    const { phone, password } = req.body;
    const result = await authService.loginWithPassword(phone, password);
    res.json(result);
  } catch (e: unknown) {
    res.status(400).json({ success: false, message: (e as Error).message });
  }
});

export default router;