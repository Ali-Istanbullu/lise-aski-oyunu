/**
 * gameController.js — Oyun HTTP handler
 * SOLID: Single Responsibility — Sadece HTTP katmanı
 */

const SaveService = require('../services/SaveService');
const StoryService = require('../services/StoryService');
const SaveRepository = require('../repositories/SaveRepository');
const { getDatabase } = require('../config/database');

function _getSaveService() {
  const db = getDatabase();
  const saveRepo = new SaveRepository(db);
  return new SaveService(saveRepo);
}

const storyService = new StoryService();

/**
 * GET /api/game/save
 */
async function getSave(req, res, next) {
  try {
    const saveService = _getSaveService();
    const save = await saveService.getSave(req.userId);
    res.json({ save });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/game/save
 */
async function updateSave(req, res, next) {
  try {
    const { sceneId, choices, flags } = req.body;
    const saveService = _getSaveService();
    const save = await saveService.updateSave(req.userId, sceneId, choices, flags);
    res.json({ message: 'Kayıt güncellendi.', save });
  } catch (err) {
    err.statusCode = 400;
    next(err);
  }
}

/**
 * DELETE /api/game/save
 */
async function resetSave(req, res, next) {
  try {
    const saveService = _getSaveService();
    const result = await saveService.resetSave(req.userId);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/game/scene/:id
 */
function getScene(req, res, next) {
  try {
    const sceneId = parseInt(req.params.id, 10);
    const { choices } = req.query;
    const parsedChoices = choices ? JSON.parse(choices) : {};
    const scene = storyService.getScene(sceneId, parsedChoices);
    res.json({ scene });
  } catch (err) {
    err.statusCode = 404;
    next(err);
  }
}

/**
 * POST /api/game/choice
 */
function makeChoice(req, res, next) {
  try {
    const { sceneId, choiceIndex, currentChoices } = req.body;
    const result = storyService.resolveChoice(sceneId, choiceIndex, currentChoices || {});
    res.json(result);
  } catch (err) {
    err.statusCode = 400;
    next(err);
  }
}

module.exports = { getSave, updateSave, resetSave, getScene, makeChoice };
