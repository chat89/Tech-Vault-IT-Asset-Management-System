import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import * as CategoryService from '../services/category.service';
import { logEvent } from '../services/audit.service';

export const getAllCategories = async (_req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const categories = await CategoryService.getAllCategories();
    res.json({ success: true, data: { categories } });
  } catch (e) { next(e); }
};

export const getCategoryById = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const category = await CategoryService.getCategoryById(req.params.id);
    res.json({ success: true, data: { category } });
  } catch (e) { next(e); }
};

export const createCategory = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const category = await CategoryService.createCategory(req.body);
    await logEvent({ userId: req.user!.id, action: 'create_asset', entityType: 'category', entityId: category.id, metadata: { name: category.name }, req });
    res.status(201).json({ success: true, message: 'Category created', data: { category } });
  } catch (e) { next(e); }
};

export const updateCategory = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const category = await CategoryService.updateCategory(req.params.id, req.body);
    res.json({ success: true, message: 'Category updated', data: { category } });
  } catch (e) { next(e); }
};

export const deleteCategory = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    await CategoryService.deleteCategory(req.params.id);
    res.json({ success: true, message: 'Category deleted' });
  } catch (e) { next(e); }
};

