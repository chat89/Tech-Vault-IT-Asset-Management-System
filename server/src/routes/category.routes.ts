import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate';
import { requirePermission } from '../middleware/permissions.middleware';
import { createCategorySchema, updateCategorySchema } from '../validators/category.validator';
import { getAllCategories, getCategoryById, createCategory, updateCategory, deleteCategory } from '../controllers/category.controller';

export const categoryRouter = Router();
categoryRouter.use(authenticate);

categoryRouter.get('/',    getAllCategories);
categoryRouter.get('/:id', getCategoryById);
categoryRouter.post('/',    authorize('super_admin','it_admin'), requirePermission('create_asset'), validate(createCategorySchema), createCategory);
categoryRouter.patch('/:id', authorize('super_admin','it_admin'), requirePermission('update_asset'), validate(updateCategorySchema), updateCategory);
categoryRouter.delete('/:id', authorize('super_admin'),          requirePermission('delete_asset'), deleteCategory);
