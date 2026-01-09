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
 * @apiExample request example:
 *  GET /api/v1/health
 *
 * @apiSuccess (200) {String} response Plain text response
 */
router.get("/health", function (req, res, next) {
  res.status(200).send("Ignition!");
});

export default router;