const core = require("@actions/core");
const exec = require("@actions/exec");
const io = require("@actions/io");
const os = require("os");

/**
 * Check if a given binary is installed.
 * @param {string} binaryName - The name of the binary to check.
 * @returns {Promise<boolean>} A promise that resolves to a boolean indicating if the binary is installed.
 */
async function isBinaryInstalled(binaryName) {
  try {
    const binaryPath = await io.which(binaryName, false);
    if (binaryPath) {
      core.info(`${binaryName} binary is installed at ${binaryPath}.`);
      return true;
    } else {
      core.info(`${binaryName} binary is not installed.`);
      return false;
    }
  } catch (error) {
    core.error(
      `An error occurred while checking for ${binaryName}: ${error.message}`,
    );
    return false;
  }
}

/**
 * Install direnv using Nix.
 * @returns {Promise<void>} A promise indicating the completion of the installation.
 */
async function installDirenv() {
  const useNixProfile = core.getBooleanInput("use_nix_profile");
  const nixChannel = core.getInput("nix_channel") || "nixpkgs";
  if (useNixProfile) {
    core.info("Installing direnv using nix profile...");
    await exec.exec("nix", ["profile", "install", `${nixChannel}#direnv`]);
  } else {
    core.info("Installing direnv using nix-env...");
    await exec.exec("nix-env", ["-f", `<${nixChannel}>`, "-i", "direnv"]);
  }
}

/**
 * Allow the .envrc file.
 * @returns {Promise<void>} A promise indicating the completion of the operation.
 */
async function allowEnvrc() {
  await exec.exec("direnv", ["allow"]);
}

/**
 * Export envrc to JSON format.
 * @returns {Promise<object>} A promise that resolves to the envrc in JSON format.
 */
async function exportEnvrc() {
  let outputBuffer = "";
  const options = {
    listeners: {
      stdout: (data) => {
        outputBuffer += data.toString();
      },
    },
  };
  await exec.exec("direnv", ["export", "json"], options);
  return JSON.parse(outputBuffer);
}

/**
 * Set environment variables from the provided envs object.
 * @param {object} envs - The environment variables to set.
 */
function setEnvironmentVariables(envs) {
  for (const [name, value] of Object.entries(envs)) {
    if (name === "PATH") {
      core.info("Detected PATH in .envrc, appending it to PATH...");
      core.addPath(value);
    } else {
      core.info(`Exporting variable ${name} with value ${value}`);
      core.exportVariable(name, value);
    }
  }
}

// Action entrypoint
async function main() {
  // Nix binary check group
  core.startGroup("Checking nix binary");
  if (os.type() === "Linux" && os.release().includes("nixos")) {
    core.info("Running on NixOS, skipping nix binary check.");
  } else {
    await isBinaryInstalled("nix");
  }
  core.endGroup();

  // Direnv installation group
  core.startGroup("Checking direnv binary");
  const isDirenvInstalled = await isBinaryInstalled("direnv");
  if (!isDirenvInstalled) {
    core.info("direnv is not installed, installing now...");
    await installDirenv();
  } else {
    core.info("direnv is already installed. Skipping installation.");
  }
  core.endGroup();

  // Envrc allowance group
  core.startGroup("Allowing .envrc");
  await allowEnvrc();
  core.endGroup();

  // Envrc export group
  core.startGroup("Exporting .envrc");
  const envs = await exportEnvrc();
  core.endGroup();

  // Environment variables setting group
  core.startGroup("Setting environment variables");
  setEnvironmentVariables(envs);
  core.endGroup();
}

// Run!
main().catch((error) => {
  core.setFailed(error.message);
});
