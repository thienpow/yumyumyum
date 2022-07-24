"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const LSP1UniversalReceiverDelegate_json_1 = __importDefault(require("../../schemas/LSP1UniversalReceiverDelegate.json"));
const LSP3UniversalProfileMetadata_json_1 = __importDefault(require("../../schemas/LSP3UniversalProfileMetadata.json"));
const LSP4DigitalAssetLegacy_json_1 = __importDefault(require("../../schemas/LSP4DigitalAssetLegacy.json"));
const LSP4DigitalAsset_json_1 = __importDefault(require("../../schemas/LSP4DigitalAsset.json"));
const LSP5ReceivedAssets_json_1 = __importDefault(require("../../schemas/LSP5ReceivedAssets.json"));
const LSP6KeyManager_json_1 = __importDefault(require("../../schemas/LSP6KeyManager.json"));
exports.default = LSP1UniversalReceiverDelegate_json_1.default.concat(LSP3UniversalProfileMetadata_json_1.default, LSP4DigitalAssetLegacy_json_1.default, LSP4DigitalAsset_json_1.default, LSP5ReceivedAssets_json_1.default, LSP6KeyManager_json_1.default);
//# sourceMappingURL=index.js.map