import { Router } from "express";
import { AuthController } from "../controllers/AuthController";
import { body, param } from "express-validator";
import { handleInputErrors } from "../middleware/validation";
import { authenticate } from "../middleware/auth";

const router = Router();

router.post(
  "/create-account",
  body("name").trim().notEmpty().withMessage("El nombre no puede estar vacio"),
  body("email")
    .trim()
    .notEmpty()
    .withMessage("El email no puede estar vacio")
    .isEmail()
    .withMessage("Debe ingresar un email valido"),
  body("password")
    .trim()
    .notEmpty()
    .withMessage("El password no puede estar vacio")
    .isLength({ min: 8 })
    .withMessage("El password debe ser minimo de 8 caracteres"),
  body("password_confirmation").custom((value, { req }) => {
    if (req.body.password !== value) {
      throw new Error("Valide la contraseña");
    }
    return true;
  }),
  handleInputErrors,
  AuthController.createAccount
);

router.post(
  "/confirm-account",
  body("token").trim().notEmpty().withMessage("El token no puede estar vacio"),
  handleInputErrors,
  AuthController.confirmAccount
);

router.post(
  "/login",
  body("email")
    .trim()
    .notEmpty()
    .withMessage("El email no puede estar vacio")
    .isEmail()
    .withMessage("Debe ingresar un email valido"),
  body("password")
    .trim()
    .notEmpty()
    .isLength({ min: 8 })
    .withMessage("El password no puede estar vacio"),
  handleInputErrors,
  AuthController.login
);

router.post(
  "/request-code",
  body("email")
    .trim()
    .notEmpty()
    .isEmail()
    .withMessage("Debe ingresar un email valido"),
  handleInputErrors,
  AuthController.requestConfirmationCode
);

router.post(
  "/forgot-password",
  body("email")
    .trim()
    .notEmpty()
    .isEmail()
    .withMessage("Debe ingresar un email valido"),
  handleInputErrors,
  AuthController.forgotPassword
);

router.post(
  "/validate-token",
  body("token").trim().notEmpty().withMessage("El token no puede estar vacio"),
  handleInputErrors,
  AuthController.validateToken
);

router.post(
  "/update-password/:token",
  param("token").isNumeric().withMessage("Token no valido"),
  body("password")
    .trim()
    .notEmpty()
    .withMessage("El password no puede estar vacio")
    .isLength({ min: 8 })
    .withMessage("El password debe ser minimo de 8 caracteres"),
  body("password_confirmation").custom((value, { req }) => {
    if (req.body.password !== value) {
      throw new Error("Valide la contraseña");
    }
    return true;
  }),
  handleInputErrors,
  AuthController.updatePasswordWithToken
);

router.get(
  '/user',
  authenticate,
  AuthController.user
)

// Profile
router.put(
  '/profile',
  authenticate,
  body("name").trim().notEmpty().withMessage("El nombre no puede estar vacio"),
  body("email")
    .trim()
    .notEmpty()
    .withMessage("El email no puede estar vacio")
    .isEmail()
    .withMessage("Debe ingresar un email valido"),
  handleInputErrors,
  AuthController.updateProfile
)

router.post(
  '/update-pasword',
  authenticate,
  body("current_password")
    .trim()
    .notEmpty()
    .withMessage("El password actual no pede ir vacio"),
  body("password")
    .trim()
    .notEmpty()
    .withMessage("El password no puede estar vacio")
    .isLength({ min: 8 })
    .withMessage("El password debe ser minimo de 8 caracteres"),
  body("password_confirmation").custom((value, { req }) => {
    if (req.body.password !== value) {
      throw new Error("Valide la contraseña");
    }
    return true;
  }),
  handleInputErrors,
  AuthController.updateCurrentUserPassword
)

router.post(
  '/check-pasword',
  authenticate,
  body("password")
    .trim()
    .notEmpty()
    .withMessage("El password no puede estar vacio"),
  handleInputErrors,
  AuthController.checkPassword
)

export default router;
