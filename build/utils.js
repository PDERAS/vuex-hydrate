import { execSync } from "child_process";
import { existsSync } from "fs";
import { join } from 'path'

export const packages = [
  "packages/@pderas/vuex-hydrate-types",
  "packages/@pderas/vuex-hydrate-state",
  "packages/@pderas/vuex-hydrate-routing",
  "packages/@pderas/vuex-hydrate-webpack-plugin",
  "packages/@pderas/vuex-hydrate-laravel-mix",
  "packages/@pderas/vuex-hydrate-phase",
];

export function git(cmd) {
  return execSync(`git ${cmd}`).toString().trim().split("\n");
}

// release/changelog parseing
export function parseChangelogLine(line) {
  const regex = /^\[(?<hash>.{7,7})\] (?<type>[\w\s\d]*)(\((?<scope>.*)\))?: (?<change>.*) \((?<author>.*)\)$/gm;
  let m;

  while ((m = regex.exec(line)) !== null) {
    // This is necessary to avoid infinite loops with zero-width matches
    if (m.index === regex.lastIndex) {
      regex.lastIndex++;
    }
    return m.groups;
  }
}

export function acceptableLines(line) {
  if (!line) return false;
  if (line.change.startsWith("wip")) return false;
  if (line.scope && line.scope.includes("release")) return false;
  return true;
}

export function formatLine(line) {
  return `- [${line.hash}]: **${line.type}${
    line.scope ? `(**_${line.scope}_**)` : ""
  }**: ${line.change} - (${line.author})`;
}

export function formatDiff(tag) {
  return function(line) {
  const [_, _base, _package] = line.split("/")
  const file = `./packages/${_base}/${_package}/package.json`
  const isForNpm = existsSync(file)
  const version = isForNpm
    ? require(join("..", file)).version
    : tag.name.replace(/^v/, "")

  const pkg = {
    base: _base,
    package: _package,
    version,
    manager: isForNpm ? "npm" : "composer",
  }

  return `- _[${`${pkg.manager}`.padEnd(8, " ")}]_ **${pkg.base}/${
    pkg.package
  }**@_${pkg.version}_`.toLowerCase();
  }
}
