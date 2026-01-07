import express from "express";

const router = express.Router();

/**
 * @api {get} /health Health check
 * @apiName HealthCheck
 * @apiGroup System
 *
 * @apiDescription
 * Simple endpoint to check if the API server is running.
 *
 * @apiSuccess (200) {String} message Server response message
 *
 * @apiSuccessExample {text} Success response:
 *     HTTP/1.1 200 OK
 *     Ignition!
 */
router.get("/health", function (req, res, next) {
  res.send("Ignition!");
});

export default router;