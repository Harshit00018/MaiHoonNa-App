import { Router, Request, Response } from 'express';
import { authenticate, validate } from './deps';
import { updateUserSchema } from '../schemas/user';
import * as userService from '../services/user_service';

const router = Router();

router.get('/:userId', authenticate, async (req: Request, res: Response) => {
  try {
    const user = await userService.getUser(req.params.userId);
    res.json({ success: true, data: user });
  } catch (e: unknown) {
    res.status(404).json({ success: false, message: (e as Error).message });
  }
});

router.put('/:userId', authenticate, validate(updateUserSchema), async (req: Request, res: Response) => {
  try {
    const user = await userService.updateUser(req.params.userId, req.body);
    res.json({ success: true, data: user });
  } catch (e: unknown) {
    res.status(404).json({ success: false, message: (e as Error).message });
  }
});

export default router;