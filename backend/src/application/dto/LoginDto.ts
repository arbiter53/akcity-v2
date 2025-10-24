import Joi from 'joi';

export interface LoginDto {
  email: string;
  password: string;
}

export const loginSchema = Joi.object<LoginDto>({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required'
    }),

  password: Joi.string()
    .required()
    .messages({
      'any.required': 'Password is required'
    })
});
