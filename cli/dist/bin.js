import Iu from "node:events";
import ju from "node:child_process";
import Nu from "node:path";
import qu from "node:fs";
import V, { stdin as Ru, stdout as Lu } from "node:process";
import "node:util";
import nu from "node:readline";
import { WriteStream as Gu } from "node:tty";
function Ou(r) {
  return r && r.__esModule && Object.prototype.hasOwnProperty.call(r, "default") ? r.default : r;
}
var y = {}, M = {}, I = {}, ou;
function K() {
  if (ou) return I;
  ou = 1;
  class r extends Error {
    /**
     * Constructs the CommanderError class
     * @param {number} exitCode suggested exit code which could be used with process.exit
     * @param {string} code an id string representing the error
     * @param {string} message human-readable description of the error
     */
    constructor(c, t, D) {
      super(D), Error.captureStackTrace(this, this.constructor), this.name = this.constructor.name, this.code = t, this.exitCode = c, this.nestedError = void 0;
    }
  }
  class s extends r {
    /**
     * Constructs the InvalidArgumentError class
     * @param {string} [message] explanation of why argument is invalid
     */
    constructor(c) {
      super(1, "commander.invalidArgument", c), Error.captureStackTrace(this, this.constructor), this.name = this.constructor.name;
    }
  }
  return I.CommanderError = r, I.InvalidArgumentError = s, I;
}
var au;
function tu() {
  if (au) return M;
  au = 1;
  const { InvalidArgumentError: r } = K();
  class s {
    /**
     * Initialize a new command argument with the given name and description.
     * The default is that the argument is required, and you can explicitly
     * indicate this with <> around the name. Put [] around the name for an optional argument.
     *
     * @param {string} name
     * @param {string} [description]
     */
    constructor(t, D) {
      switch (this.description = D || "", this.variadic = !1, this.parseArg = void 0, this.defaultValue = void 0, this.defaultValueDescription = void 0, this.argChoices = void 0, t[0]) {
        case "<":
          this.required = !0, this._name = t.slice(1, -1);
          break;
        case "[":
          this.required = !1, this._name = t.slice(1, -1);
          break;
        default:
          this.required = !0, this._name = t;
          break;
      }
      this._name.length > 3 && this._name.slice(-3) === "..." && (this.variadic = !0, this._name = this._name.slice(0, -3));
    }
    /**
     * Return argument name.
     *
     * @return {string}
     */
    name() {
      return this._name;
    }
    /**
     * @package
     */
    _concatValue(t, D) {
      return D === this.defaultValue || !Array.isArray(D) ? [t] : D.concat(t);
    }
    /**
     * Set the default value, and optionally supply the description to be displayed in the help.
     *
     * @param {*} value
     * @param {string} [description]
     * @return {Argument}
     */
    default(t, D) {
      return this.defaultValue = t, this.defaultValueDescription = D, this;
    }
    /**
     * Set the custom handler for processing CLI command arguments into argument values.
     *
     * @param {Function} [fn]
     * @return {Argument}
     */
    argParser(t) {
      return this.parseArg = t, this;
    }
    /**
     * Only allow argument value to be one of choices.
     *
     * @param {string[]} values
     * @return {Argument}
     */
    choices(t) {
      return this.argChoices = t.slice(), this.parseArg = (D, u) => {
        if (!this.argChoices.includes(D))
          throw new r(
            `Allowed choices are ${this.argChoices.join(", ")}.`
          );
        return this.variadic ? this._concatValue(D, u) : D;
      }, this;
    }
    /**
     * Make argument required.
     *
     * @returns {Argument}
     */
    argRequired() {
      return this.required = !0, this;
    }
    /**
     * Make argument optional.
     *
     * @returns {Argument}
     */
    argOptional() {
      return this.required = !1, this;
    }
  }
  function o(c) {
    const t = c.name() + (c.variadic === !0 ? "..." : "");
    return c.required ? "<" + t + ">" : "[" + t + "]";
  }
  return M.Argument = s, M.humanReadableArgName = o, M;
}
var j = {}, N = {}, lu;
function vu() {
  if (lu) return N;
  lu = 1;
  const { humanReadableArgName: r } = tu();
  class s {
    constructor() {
      this.helpWidth = void 0, this.minWidthToWrap = 40, this.sortSubcommands = !1, this.sortOptions = !1, this.showGlobalOptions = !1;
    }
    /**
     * prepareContext is called by Commander after applying overrides from `Command.configureHelp()`
     * and just before calling `formatHelp()`.
     *
     * Commander just uses the helpWidth and the rest is provided for optional use by more complex subclasses.
     *
     * @param {{ error?: boolean, helpWidth?: number, outputHasColors?: boolean }} contextOptions
     */
    prepareContext(t) {
      this.helpWidth = this.helpWidth ?? t.helpWidth ?? 80;
    }
    /**
     * Get an array of the visible subcommands. Includes a placeholder for the implicit help command, if there is one.
     *
     * @param {Command} cmd
     * @returns {Command[]}
     */
    visibleCommands(t) {
      const D = t.commands.filter((l) => !l._hidden), u = t._getHelpCommand();
      return u && !u._hidden && D.push(u), this.sortSubcommands && D.sort((l, p) => l.name().localeCompare(p.name())), D;
    }
    /**
     * Compare options for sort.
     *
     * @param {Option} a
     * @param {Option} b
     * @returns {number}
     */
    compareOptions(t, D) {
      const u = (l) => l.short ? l.short.replace(/^-/, "") : l.long.replace(/^--/, "");
      return u(t).localeCompare(u(D));
    }
    /**
     * Get an array of the visible options. Includes a placeholder for the implicit help option, if there is one.
     *
     * @param {Command} cmd
     * @returns {Option[]}
     */
    visibleOptions(t) {
      const D = t.options.filter((l) => !l.hidden), u = t._getHelpOption();
      if (u && !u.hidden) {
        const l = u.short && t._findOption(u.short), p = u.long && t._findOption(u.long);
        !l && !p ? D.push(u) : u.long && !p ? D.push(
          t.createOption(u.long, u.description)
        ) : u.short && !l && D.push(
          t.createOption(u.short, u.description)
        );
      }
      return this.sortOptions && D.sort(this.compareOptions), D;
    }
    /**
     * Get an array of the visible global options. (Not including help.)
     *
     * @param {Command} cmd
     * @returns {Option[]}
     */
    visibleGlobalOptions(t) {
      if (!this.showGlobalOptions) return [];
      const D = [];
      for (let u = t.parent; u; u = u.parent) {
        const l = u.options.filter(
          (p) => !p.hidden
        );
        D.push(...l);
      }
      return this.sortOptions && D.sort(this.compareOptions), D;
    }
    /**
     * Get an array of the arguments if any have a description.
     *
     * @param {Command} cmd
     * @returns {Argument[]}
     */
    visibleArguments(t) {
      return t._argsDescription && t.registeredArguments.forEach((D) => {
        D.description = D.description || t._argsDescription[D.name()] || "";
      }), t.registeredArguments.find((D) => D.description) ? t.registeredArguments : [];
    }
    /**
     * Get the command term to show in the list of subcommands.
     *
     * @param {Command} cmd
     * @returns {string}
     */
    subcommandTerm(t) {
      const D = t.registeredArguments.map((u) => r(u)).join(" ");
      return t._name + (t._aliases[0] ? "|" + t._aliases[0] : "") + (t.options.length ? " [options]" : "") + // simplistic check for non-help option
      (D ? " " + D : "");
    }
    /**
     * Get the option term to show in the list of options.
     *
     * @param {Option} option
     * @returns {string}
     */
    optionTerm(t) {
      return t.flags;
    }
    /**
     * Get the argument term to show in the list of arguments.
     *
     * @param {Argument} argument
     * @returns {string}
     */
    argumentTerm(t) {
      return t.name();
    }
    /**
     * Get the longest command term length.
     *
     * @param {Command} cmd
     * @param {Help} helper
     * @returns {number}
     */
    longestSubcommandTermLength(t, D) {
      return D.visibleCommands(t).reduce((u, l) => Math.max(
        u,
        this.displayWidth(
          D.styleSubcommandTerm(D.subcommandTerm(l))
        )
      ), 0);
    }
    /**
     * Get the longest option term length.
     *
     * @param {Command} cmd
     * @param {Help} helper
     * @returns {number}
     */
    longestOptionTermLength(t, D) {
      return D.visibleOptions(t).reduce((u, l) => Math.max(
        u,
        this.displayWidth(D.styleOptionTerm(D.optionTerm(l)))
      ), 0);
    }
    /**
     * Get the longest global option term length.
     *
     * @param {Command} cmd
     * @param {Help} helper
     * @returns {number}
     */
    longestGlobalOptionTermLength(t, D) {
      return D.visibleGlobalOptions(t).reduce((u, l) => Math.max(
        u,
        this.displayWidth(D.styleOptionTerm(D.optionTerm(l)))
      ), 0);
    }
    /**
     * Get the longest argument term length.
     *
     * @param {Command} cmd
     * @param {Help} helper
     * @returns {number}
     */
    longestArgumentTermLength(t, D) {
      return D.visibleArguments(t).reduce((u, l) => Math.max(
        u,
        this.displayWidth(
          D.styleArgumentTerm(D.argumentTerm(l))
        )
      ), 0);
    }
    /**
     * Get the command usage to be displayed at the top of the built-in help.
     *
     * @param {Command} cmd
     * @returns {string}
     */
    commandUsage(t) {
      let D = t._name;
      t._aliases[0] && (D = D + "|" + t._aliases[0]);
      let u = "";
      for (let l = t.parent; l; l = l.parent)
        u = l.name() + " " + u;
      return u + D + " " + t.usage();
    }
    /**
     * Get the description for the command.
     *
     * @param {Command} cmd
     * @returns {string}
     */
    commandDescription(t) {
      return t.description();
    }
    /**
     * Get the subcommand summary to show in the list of subcommands.
     * (Fallback to description for backwards compatibility.)
     *
     * @param {Command} cmd
     * @returns {string}
     */
    subcommandDescription(t) {
      return t.summary() || t.description();
    }
    /**
     * Get the option description to show in the list of options.
     *
     * @param {Option} option
     * @return {string}
     */
    optionDescription(t) {
      const D = [];
      return t.argChoices && D.push(
        // use stringify to match the display of the default value
        `choices: ${t.argChoices.map((u) => JSON.stringify(u)).join(", ")}`
      ), t.defaultValue !== void 0 && (t.required || t.optional || t.isBoolean() && typeof t.defaultValue == "boolean") && D.push(
        `default: ${t.defaultValueDescription || JSON.stringify(t.defaultValue)}`
      ), t.presetArg !== void 0 && t.optional && D.push(`preset: ${JSON.stringify(t.presetArg)}`), t.envVar !== void 0 && D.push(`env: ${t.envVar}`), D.length > 0 ? `${t.description} (${D.join(", ")})` : t.description;
    }
    /**
     * Get the argument description to show in the list of arguments.
     *
     * @param {Argument} argument
     * @return {string}
     */
    argumentDescription(t) {
      const D = [];
      if (t.argChoices && D.push(
        // use stringify to match the display of the default value
        `choices: ${t.argChoices.map((u) => JSON.stringify(u)).join(", ")}`
      ), t.defaultValue !== void 0 && D.push(
        `default: ${t.defaultValueDescription || JSON.stringify(t.defaultValue)}`
      ), D.length > 0) {
        const u = `(${D.join(", ")})`;
        return t.description ? `${t.description} ${u}` : u;
      }
      return t.description;
    }
    /**
     * Generate the built-in help text.
     *
     * @param {Command} cmd
     * @param {Help} helper
     * @returns {string}
     */
    formatHelp(t, D) {
      const u = D.padWidth(t, D), l = D.helpWidth ?? 80;
      function p(b, T) {
        return D.formatItem(b, u, T, D);
      }
      let F = [
        `${D.styleTitle("Usage:")} ${D.styleUsage(D.commandUsage(t))}`,
        ""
      ];
      const f = D.commandDescription(t);
      f.length > 0 && (F = F.concat([
        D.boxWrap(
          D.styleCommandDescription(f),
          l
        ),
        ""
      ]));
      const g = D.visibleArguments(t).map((b) => p(
        D.styleArgumentTerm(D.argumentTerm(b)),
        D.styleArgumentDescription(D.argumentDescription(b))
      ));
      g.length > 0 && (F = F.concat([
        D.styleTitle("Arguments:"),
        ...g,
        ""
      ]));
      const B = D.visibleOptions(t).map((b) => p(
        D.styleOptionTerm(D.optionTerm(b)),
        D.styleOptionDescription(D.optionDescription(b))
      ));
      if (B.length > 0 && (F = F.concat([
        D.styleTitle("Options:"),
        ...B,
        ""
      ])), D.showGlobalOptions) {
        const b = D.visibleGlobalOptions(t).map((T) => p(
          D.styleOptionTerm(D.optionTerm(T)),
          D.styleOptionDescription(D.optionDescription(T))
        ));
        b.length > 0 && (F = F.concat([
          D.styleTitle("Global Options:"),
          ...b,
          ""
        ]));
      }
      const v = D.visibleCommands(t).map((b) => p(
        D.styleSubcommandTerm(D.subcommandTerm(b)),
        D.styleSubcommandDescription(D.subcommandDescription(b))
      ));
      return v.length > 0 && (F = F.concat([
        D.styleTitle("Commands:"),
        ...v,
        ""
      ])), F.join(`
`);
    }
    /**
     * Return display width of string, ignoring ANSI escape sequences. Used in padding and wrapping calculations.
     *
     * @param {string} str
     * @returns {number}
     */
    displayWidth(t) {
      return o(t).length;
    }
    /**
     * Style the title for displaying in the help. Called with 'Usage:', 'Options:', etc.
     *
     * @param {string} str
     * @returns {string}
     */
    styleTitle(t) {
      return t;
    }
    styleUsage(t) {
      return t.split(" ").map((D) => D === "[options]" ? this.styleOptionText(D) : D === "[command]" ? this.styleSubcommandText(D) : D[0] === "[" || D[0] === "<" ? this.styleArgumentText(D) : this.styleCommandText(D)).join(" ");
    }
    styleCommandDescription(t) {
      return this.styleDescriptionText(t);
    }
    styleOptionDescription(t) {
      return this.styleDescriptionText(t);
    }
    styleSubcommandDescription(t) {
      return this.styleDescriptionText(t);
    }
    styleArgumentDescription(t) {
      return this.styleDescriptionText(t);
    }
    styleDescriptionText(t) {
      return t;
    }
    styleOptionTerm(t) {
      return this.styleOptionText(t);
    }
    styleSubcommandTerm(t) {
      return t.split(" ").map((D) => D === "[options]" ? this.styleOptionText(D) : D[0] === "[" || D[0] === "<" ? this.styleArgumentText(D) : this.styleSubcommandText(D)).join(" ");
    }
    styleArgumentTerm(t) {
      return this.styleArgumentText(t);
    }
    styleOptionText(t) {
      return t;
    }
    styleArgumentText(t) {
      return t;
    }
    styleSubcommandText(t) {
      return t;
    }
    styleCommandText(t) {
      return t;
    }
    /**
     * Calculate the pad width from the maximum term length.
     *
     * @param {Command} cmd
     * @param {Help} helper
     * @returns {number}
     */
    padWidth(t, D) {
      return Math.max(
        D.longestOptionTermLength(t, D),
        D.longestGlobalOptionTermLength(t, D),
        D.longestSubcommandTermLength(t, D),
        D.longestArgumentTermLength(t, D)
      );
    }
    /**
     * Detect manually wrapped and indented strings by checking for line break followed by whitespace.
     *
     * @param {string} str
     * @returns {boolean}
     */
    preformatted(t) {
      return /\n[^\S\r\n]/.test(t);
    }
    /**
     * Format the "item", which consists of a term and description. Pad the term and wrap the description, indenting the following lines.
     *
     * So "TTT", 5, "DDD DDDD DD DDD" might be formatted for this.helpWidth=17 like so:
     *   TTT  DDD DDDD
     *        DD DDD
     *
     * @param {string} term
     * @param {number} termWidth
     * @param {string} description
     * @param {Help} helper
     * @returns {string}
     */
    formatItem(t, D, u, l) {
      const F = " ".repeat(2);
      if (!u) return F + t;
      const f = t.padEnd(
        D + t.length - l.displayWidth(t)
      ), g = 2, v = (this.helpWidth ?? 80) - D - g - 2;
      let b;
      return v < this.minWidthToWrap || l.preformatted(u) ? b = u : b = l.boxWrap(u, v).replace(
        /\n/g,
        `
` + " ".repeat(D + g)
      ), F + f + " ".repeat(g) + b.replace(/\n/g, `
${F}`);
    }
    /**
     * Wrap a string at whitespace, preserving existing line breaks.
     * Wrapping is skipped if the width is less than `minWidthToWrap`.
     *
     * @param {string} str
     * @param {number} width
     * @returns {string}
     */
    boxWrap(t, D) {
      if (D < this.minWidthToWrap) return t;
      const u = t.split(/\r\n|\n/), l = /[\s]*[^\s]+/g, p = [];
      return u.forEach((F) => {
        const f = F.match(l);
        if (f === null) {
          p.push("");
          return;
        }
        let g = [f.shift()], B = this.displayWidth(g[0]);
        f.forEach((v) => {
          const b = this.displayWidth(v);
          if (B + b <= D) {
            g.push(v), B += b;
            return;
          }
          p.push(g.join(""));
          const T = v.trimStart();
          g = [T], B = this.displayWidth(T);
        }), p.push(g.join(""));
      }), p.join(`
`);
    }
  }
  function o(c) {
    const t = /\x1b\[\d*(;\d*)*m/g;
    return c.replace(t, "");
  }
  return N.Help = s, N.stripColor = o, N;
}
var q = {}, hu;
function $u() {
  if (hu) return q;
  hu = 1;
  const { InvalidArgumentError: r } = K();
  class s {
    /**
     * Initialize a new `Option` with the given `flags` and `description`.
     *
     * @param {string} flags
     * @param {string} [description]
     */
    constructor(u, l) {
      this.flags = u, this.description = l || "", this.required = u.includes("<"), this.optional = u.includes("["), this.variadic = /\w\.\.\.[>\]]$/.test(u), this.mandatory = !1;
      const p = t(u);
      this.short = p.shortFlag, this.long = p.longFlag, this.negate = !1, this.long && (this.negate = this.long.startsWith("--no-")), this.defaultValue = void 0, this.defaultValueDescription = void 0, this.presetArg = void 0, this.envVar = void 0, this.parseArg = void 0, this.hidden = !1, this.argChoices = void 0, this.conflictsWith = [], this.implied = void 0;
    }
    /**
     * Set the default value, and optionally supply the description to be displayed in the help.
     *
     * @param {*} value
     * @param {string} [description]
     * @return {Option}
     */
    default(u, l) {
      return this.defaultValue = u, this.defaultValueDescription = l, this;
    }
    /**
     * Preset to use when option used without option-argument, especially optional but also boolean and negated.
     * The custom processing (parseArg) is called.
     *
     * @example
     * new Option('--color').default('GREYSCALE').preset('RGB');
     * new Option('--donate [amount]').preset('20').argParser(parseFloat);
     *
     * @param {*} arg
     * @return {Option}
     */
    preset(u) {
      return this.presetArg = u, this;
    }
    /**
     * Add option name(s) that conflict with this option.
     * An error will be displayed if conflicting options are found during parsing.
     *
     * @example
     * new Option('--rgb').conflicts('cmyk');
     * new Option('--js').conflicts(['ts', 'jsx']);
     *
     * @param {(string | string[])} names
     * @return {Option}
     */
    conflicts(u) {
      return this.conflictsWith = this.conflictsWith.concat(u), this;
    }
    /**
     * Specify implied option values for when this option is set and the implied options are not.
     *
     * The custom processing (parseArg) is not called on the implied values.
     *
     * @example
     * program
     *   .addOption(new Option('--log', 'write logging information to file'))
     *   .addOption(new Option('--trace', 'log extra details').implies({ log: 'trace.txt' }));
     *
     * @param {object} impliedOptionValues
     * @return {Option}
     */
    implies(u) {
      let l = u;
      return typeof u == "string" && (l = { [u]: !0 }), this.implied = Object.assign(this.implied || {}, l), this;
    }
    /**
     * Set environment variable to check for option value.
     *
     * An environment variable is only used if when processed the current option value is
     * undefined, or the source of the current value is 'default' or 'config' or 'env'.
     *
     * @param {string} name
     * @return {Option}
     */
    env(u) {
      return this.envVar = u, this;
    }
    /**
     * Set the custom handler for processing CLI option arguments into option values.
     *
     * @param {Function} [fn]
     * @return {Option}
     */
    argParser(u) {
      return this.parseArg = u, this;
    }
    /**
     * Whether the option is mandatory and must have a value after parsing.
     *
     * @param {boolean} [mandatory=true]
     * @return {Option}
     */
    makeOptionMandatory(u = !0) {
      return this.mandatory = !!u, this;
    }
    /**
     * Hide option in help.
     *
     * @param {boolean} [hide=true]
     * @return {Option}
     */
    hideHelp(u = !0) {
      return this.hidden = !!u, this;
    }
    /**
     * @package
     */
    _concatValue(u, l) {
      return l === this.defaultValue || !Array.isArray(l) ? [u] : l.concat(u);
    }
    /**
     * Only allow option value to be one of choices.
     *
     * @param {string[]} values
     * @return {Option}
     */
    choices(u) {
      return this.argChoices = u.slice(), this.parseArg = (l, p) => {
        if (!this.argChoices.includes(l))
          throw new r(
            `Allowed choices are ${this.argChoices.join(", ")}.`
          );
        return this.variadic ? this._concatValue(l, p) : l;
      }, this;
    }
    /**
     * Return option name.
     *
     * @return {string}
     */
    name() {
      return this.long ? this.long.replace(/^--/, "") : this.short.replace(/^-/, "");
    }
    /**
     * Return option name, in a camelcase format that can be used
     * as an object attribute key.
     *
     * @return {string}
     */
    attributeName() {
      return this.negate ? c(this.name().replace(/^no-/, "")) : c(this.name());
    }
    /**
     * Check if `arg` matches the short or long flag.
     *
     * @param {string} arg
     * @return {boolean}
     * @package
     */
    is(u) {
      return this.short === u || this.long === u;
    }
    /**
     * Return whether a boolean option.
     *
     * Options are one of boolean, negated, required argument, or optional argument.
     *
     * @return {boolean}
     * @package
     */
    isBoolean() {
      return !this.required && !this.optional && !this.negate;
    }
  }
  class o {
    /**
     * @param {Option[]} options
     */
    constructor(u) {
      this.positiveOptions = /* @__PURE__ */ new Map(), this.negativeOptions = /* @__PURE__ */ new Map(), this.dualOptions = /* @__PURE__ */ new Set(), u.forEach((l) => {
        l.negate ? this.negativeOptions.set(l.attributeName(), l) : this.positiveOptions.set(l.attributeName(), l);
      }), this.negativeOptions.forEach((l, p) => {
        this.positiveOptions.has(p) && this.dualOptions.add(p);
      });
    }
    /**
     * Did the value come from the option, and not from possible matching dual option?
     *
     * @param {*} value
     * @param {Option} option
     * @returns {boolean}
     */
    valueFromOption(u, l) {
      const p = l.attributeName();
      if (!this.dualOptions.has(p)) return !0;
      const F = this.negativeOptions.get(p).presetArg, f = F !== void 0 ? F : !1;
      return l.negate === (f === u);
    }
  }
  function c(D) {
    return D.split("-").reduce((u, l) => u + l[0].toUpperCase() + l.slice(1));
  }
  function t(D) {
    let u, l;
    const p = /^-[^-]$/, F = /^--[^-]/, f = D.split(/[ |,]+/).concat("guard");
    if (p.test(f[0]) && (u = f.shift()), F.test(f[0]) && (l = f.shift()), !u && p.test(f[0]) && (u = f.shift()), !u && F.test(f[0]) && (u = l, l = f.shift()), f[0].startsWith("-")) {
      const g = f[0], B = `option creation failed due to '${g}' in option flags '${D}'`;
      throw /^-[^-][^-]/.test(g) ? new Error(
        `${B}
- a short flag is a single dash and a single character
  - either use a single dash and a single character (for a short flag)
  - or use a double dash for a long option (and can have two, like '--ws, --workspace')`
      ) : p.test(g) ? new Error(`${B}
- too many short flags`) : F.test(g) ? new Error(`${B}
- too many long flags`) : new Error(`${B}
- unrecognised flag format`);
    }
    if (u === void 0 && l === void 0)
      throw new Error(
        `option creation failed due to no flags found in '${D}'.`
      );
    return { shortFlag: u, longFlag: l };
  }
  return q.Option = s, q.DualOptions = o, q;
}
var J = {}, cu;
function Uu() {
  if (cu) return J;
  cu = 1;
  const r = 3;
  function s(c, t) {
    if (Math.abs(c.length - t.length) > r)
      return Math.max(c.length, t.length);
    const D = [];
    for (let u = 0; u <= c.length; u++)
      D[u] = [u];
    for (let u = 0; u <= t.length; u++)
      D[0][u] = u;
    for (let u = 1; u <= t.length; u++)
      for (let l = 1; l <= c.length; l++) {
        let p = 1;
        c[l - 1] === t[u - 1] ? p = 0 : p = 1, D[l][u] = Math.min(
          D[l - 1][u] + 1,
          // deletion
          D[l][u - 1] + 1,
          // insertion
          D[l - 1][u - 1] + p
          // substitution
        ), l > 1 && u > 1 && c[l - 1] === t[u - 2] && c[l - 2] === t[u - 1] && (D[l][u] = Math.min(D[l][u], D[l - 2][u - 2] + 1));
      }
    return D[c.length][t.length];
  }
  function o(c, t) {
    if (!t || t.length === 0) return "";
    t = Array.from(new Set(t));
    const D = c.startsWith("--");
    D && (c = c.slice(2), t = t.map((F) => F.slice(2)));
    let u = [], l = r;
    const p = 0.4;
    return t.forEach((F) => {
      if (F.length <= 1) return;
      const f = s(c, F), g = Math.max(c.length, F.length);
      (g - f) / g > p && (f < l ? (l = f, u = [F]) : f === l && u.push(F));
    }), u.sort((F, f) => F.localeCompare(f)), D && (u = u.map((F) => `--${F}`)), u.length > 1 ? `
(Did you mean one of ${u.join(", ")}?)` : u.length === 1 ? `
(Did you mean ${u[0]}?)` : "";
  }
  return J.suggestSimilar = o, J;
}
var Cu;
function Ku() {
  if (Cu) return j;
  Cu = 1;
  const r = Iu.EventEmitter, s = ju, o = Nu, c = qu, t = V, { Argument: D, humanReadableArgName: u } = tu(), { CommanderError: l } = K(), { Help: p, stripColor: F } = vu(), { Option: f, DualOptions: g } = $u(), { suggestSimilar: B } = Uu();
  class v extends r {
    /**
     * Initialize a new `Command`.
     *
     * @param {string} [name]
     */
    constructor(e) {
      super(), this.commands = [], this.options = [], this.parent = null, this._allowUnknownOption = !1, this._allowExcessArguments = !1, this.registeredArguments = [], this._args = this.registeredArguments, this.args = [], this.rawArgs = [], this.processedArgs = [], this._scriptPath = null, this._name = e || "", this._optionValues = {}, this._optionValueSources = {}, this._storeOptionsAsProperties = !1, this._actionHandler = null, this._executableHandler = !1, this._executableFile = null, this._executableDir = null, this._defaultCommandName = null, this._exitCallback = null, this._aliases = [], this._combineFlagAndOptionalValue = !0, this._description = "", this._summary = "", this._argsDescription = void 0, this._enablePositionalOptions = !1, this._passThroughOptions = !1, this._lifeCycleHooks = {}, this._showHelpAfterError = !1, this._showSuggestionAfterError = !0, this._savedState = null, this._outputConfiguration = {
        writeOut: (i) => t.stdout.write(i),
        writeErr: (i) => t.stderr.write(i),
        outputError: (i, n) => n(i),
        getOutHelpWidth: () => t.stdout.isTTY ? t.stdout.columns : void 0,
        getErrHelpWidth: () => t.stderr.isTTY ? t.stderr.columns : void 0,
        getOutHasColors: () => T() ?? (t.stdout.isTTY && t.stdout.hasColors?.()),
        getErrHasColors: () => T() ?? (t.stderr.isTTY && t.stderr.hasColors?.()),
        stripColor: (i) => F(i)
      }, this._hidden = !1, this._helpOption = void 0, this._addImplicitHelpCommand = void 0, this._helpCommand = void 0, this._helpConfiguration = {};
    }
    /**
     * Copy settings that are useful to have in common across root command and subcommands.
     *
     * (Used internally when adding a command using `.command()` so subcommands inherit parent settings.)
     *
     * @param {Command} sourceCommand
     * @return {Command} `this` command for chaining
     */
    copyInheritedSettings(e) {
      return this._outputConfiguration = e._outputConfiguration, this._helpOption = e._helpOption, this._helpCommand = e._helpCommand, this._helpConfiguration = e._helpConfiguration, this._exitCallback = e._exitCallback, this._storeOptionsAsProperties = e._storeOptionsAsProperties, this._combineFlagAndOptionalValue = e._combineFlagAndOptionalValue, this._allowExcessArguments = e._allowExcessArguments, this._enablePositionalOptions = e._enablePositionalOptions, this._showHelpAfterError = e._showHelpAfterError, this._showSuggestionAfterError = e._showSuggestionAfterError, this;
    }
    /**
     * @returns {Command[]}
     * @private
     */
    _getCommandAndAncestors() {
      const e = [];
      for (let i = this; i; i = i.parent)
        e.push(i);
      return e;
    }
    /**
     * Define a command.
     *
     * There are two styles of command: pay attention to where to put the description.
     *
     * @example
     * // Command implemented using action handler (description is supplied separately to `.command`)
     * program
     *   .command('clone <source> [destination]')
     *   .description('clone a repository into a newly created directory')
     *   .action((source, destination) => {
     *     console.log('clone command called');
     *   });
     *
     * // Command implemented using separate executable file (description is second parameter to `.command`)
     * program
     *   .command('start <service>', 'start named service')
     *   .command('stop [service]', 'stop named service, or all if no name supplied');
     *
     * @param {string} nameAndArgs - command name and arguments, args are `<required>` or `[optional]` and last may also be `variadic...`
     * @param {(object | string)} [actionOptsOrExecDesc] - configuration options (for action), or description (for executable)
     * @param {object} [execOpts] - configuration options (for executable)
     * @return {Command} returns new command for action handler, or `this` for executable command
     */
    command(e, i, n) {
      let h = i, a = n;
      typeof h == "object" && h !== null && (a = h, h = null), a = a || {};
      const [, C, E] = e.match(/([^ ]+) *(.*)/), m = this.createCommand(C);
      return h && (m.description(h), m._executableHandler = !0), a.isDefault && (this._defaultCommandName = m._name), m._hidden = !!(a.noHelp || a.hidden), m._executableFile = a.executableFile || null, E && m.arguments(E), this._registerCommand(m), m.parent = this, m.copyInheritedSettings(this), h ? this : m;
    }
    /**
     * Factory routine to create a new unattached command.
     *
     * See .command() for creating an attached subcommand, which uses this routine to
     * create the command. You can override createCommand to customise subcommands.
     *
     * @param {string} [name]
     * @return {Command} new command
     */
    createCommand(e) {
      return new v(e);
    }
    /**
     * You can customise the help with a subclass of Help by overriding createHelp,
     * or by overriding Help properties using configureHelp().
     *
     * @return {Help}
     */
    createHelp() {
      return Object.assign(new p(), this.configureHelp());
    }
    /**
     * You can customise the help by overriding Help properties using configureHelp(),
     * or with a subclass of Help by overriding createHelp().
     *
     * @param {object} [configuration] - configuration options
     * @return {(Command | object)} `this` command for chaining, or stored configuration
     */
    configureHelp(e) {
      return e === void 0 ? this._helpConfiguration : (this._helpConfiguration = e, this);
    }
    /**
     * The default output goes to stdout and stderr. You can customise this for special
     * applications. You can also customise the display of errors by overriding outputError.
     *
     * The configuration properties are all functions:
     *
     *     // change how output being written, defaults to stdout and stderr
     *     writeOut(str)
     *     writeErr(str)
     *     // change how output being written for errors, defaults to writeErr
     *     outputError(str, write) // used for displaying errors and not used for displaying help
     *     // specify width for wrapping help
     *     getOutHelpWidth()
     *     getErrHelpWidth()
     *     // color support, currently only used with Help
     *     getOutHasColors()
     *     getErrHasColors()
     *     stripColor() // used to remove ANSI escape codes if output does not have colors
     *
     * @param {object} [configuration] - configuration options
     * @return {(Command | object)} `this` command for chaining, or stored configuration
     */
    configureOutput(e) {
      return e === void 0 ? this._outputConfiguration : (Object.assign(this._outputConfiguration, e), this);
    }
    /**
     * Display the help or a custom message after an error occurs.
     *
     * @param {(boolean|string)} [displayHelp]
     * @return {Command} `this` command for chaining
     */
    showHelpAfterError(e = !0) {
      return typeof e != "string" && (e = !!e), this._showHelpAfterError = e, this;
    }
    /**
     * Display suggestion of similar commands for unknown commands, or options for unknown options.
     *
     * @param {boolean} [displaySuggestion]
     * @return {Command} `this` command for chaining
     */
    showSuggestionAfterError(e = !0) {
      return this._showSuggestionAfterError = !!e, this;
    }
    /**
     * Add a prepared subcommand.
     *
     * See .command() for creating an attached subcommand which inherits settings from its parent.
     *
     * @param {Command} cmd - new subcommand
     * @param {object} [opts] - configuration options
     * @return {Command} `this` command for chaining
     */
    addCommand(e, i) {
      if (!e._name)
        throw new Error(`Command passed to .addCommand() must have a name
- specify the name in Command constructor or using .name()`);
      return i = i || {}, i.isDefault && (this._defaultCommandName = e._name), (i.noHelp || i.hidden) && (e._hidden = !0), this._registerCommand(e), e.parent = this, e._checkForBrokenPassThrough(), this;
    }
    /**
     * Factory routine to create a new unattached argument.
     *
     * See .argument() for creating an attached argument, which uses this routine to
     * create the argument. You can override createArgument to return a custom argument.
     *
     * @param {string} name
     * @param {string} [description]
     * @return {Argument} new argument
     */
    createArgument(e, i) {
      return new D(e, i);
    }
    /**
     * Define argument syntax for command.
     *
     * The default is that the argument is required, and you can explicitly
     * indicate this with <> around the name. Put [] around the name for an optional argument.
     *
     * @example
     * program.argument('<input-file>');
     * program.argument('[output-file]');
     *
     * @param {string} name
     * @param {string} [description]
     * @param {(Function|*)} [fn] - custom argument processing function
     * @param {*} [defaultValue]
     * @return {Command} `this` command for chaining
     */
    argument(e, i, n, h) {
      const a = this.createArgument(e, i);
      return typeof n == "function" ? a.default(h).argParser(n) : a.default(n), this.addArgument(a), this;
    }
    /**
     * Define argument syntax for command, adding multiple at once (without descriptions).
     *
     * See also .argument().
     *
     * @example
     * program.arguments('<cmd> [env]');
     *
     * @param {string} names
     * @return {Command} `this` command for chaining
     */
    arguments(e) {
      return e.trim().split(/ +/).forEach((i) => {
        this.argument(i);
      }), this;
    }
    /**
     * Define argument syntax for command, adding a prepared argument.
     *
     * @param {Argument} argument
     * @return {Command} `this` command for chaining
     */
    addArgument(e) {
      const i = this.registeredArguments.slice(-1)[0];
      if (i && i.variadic)
        throw new Error(
          `only the last argument can be variadic '${i.name()}'`
        );
      if (e.required && e.defaultValue !== void 0 && e.parseArg === void 0)
        throw new Error(
          `a default value for a required argument is never used: '${e.name()}'`
        );
      return this.registeredArguments.push(e), this;
    }
    /**
     * Customise or override default help command. By default a help command is automatically added if your command has subcommands.
     *
     * @example
     *    program.helpCommand('help [cmd]');
     *    program.helpCommand('help [cmd]', 'show help');
     *    program.helpCommand(false); // suppress default help command
     *    program.helpCommand(true); // add help command even if no subcommands
     *
     * @param {string|boolean} enableOrNameAndArgs - enable with custom name and/or arguments, or boolean to override whether added
     * @param {string} [description] - custom description
     * @return {Command} `this` command for chaining
     */
    helpCommand(e, i) {
      if (typeof e == "boolean")
        return this._addImplicitHelpCommand = e, this;
      e = e ?? "help [command]";
      const [, n, h] = e.match(/([^ ]+) *(.*)/), a = i ?? "display help for command", C = this.createCommand(n);
      return C.helpOption(!1), h && C.arguments(h), a && C.description(a), this._addImplicitHelpCommand = !0, this._helpCommand = C, this;
    }
    /**
     * Add prepared custom help command.
     *
     * @param {(Command|string|boolean)} helpCommand - custom help command, or deprecated enableOrNameAndArgs as for `.helpCommand()`
     * @param {string} [deprecatedDescription] - deprecated custom description used with custom name only
     * @return {Command} `this` command for chaining
     */
    addHelpCommand(e, i) {
      return typeof e != "object" ? (this.helpCommand(e, i), this) : (this._addImplicitHelpCommand = !0, this._helpCommand = e, this);
    }
    /**
     * Lazy create help command.
     *
     * @return {(Command|null)}
     * @package
     */
    _getHelpCommand() {
      return this._addImplicitHelpCommand ?? (this.commands.length && !this._actionHandler && !this._findCommand("help")) ? (this._helpCommand === void 0 && this.helpCommand(void 0, void 0), this._helpCommand) : null;
    }
    /**
     * Add hook for life cycle event.
     *
     * @param {string} event
     * @param {Function} listener
     * @return {Command} `this` command for chaining
     */
    hook(e, i) {
      const n = ["preSubcommand", "preAction", "postAction"];
      if (!n.includes(e))
        throw new Error(`Unexpected value for event passed to hook : '${e}'.
Expecting one of '${n.join("', '")}'`);
      return this._lifeCycleHooks[e] ? this._lifeCycleHooks[e].push(i) : this._lifeCycleHooks[e] = [i], this;
    }
    /**
     * Register callback to use as replacement for calling process.exit.
     *
     * @param {Function} [fn] optional callback which will be passed a CommanderError, defaults to throwing
     * @return {Command} `this` command for chaining
     */
    exitOverride(e) {
      return e ? this._exitCallback = e : this._exitCallback = (i) => {
        if (i.code !== "commander.executeSubCommandAsync")
          throw i;
      }, this;
    }
    /**
     * Call process.exit, and _exitCallback if defined.
     *
     * @param {number} exitCode exit code for using with process.exit
     * @param {string} code an id string representing the error
     * @param {string} message human-readable description of the error
     * @return never
     * @private
     */
    _exit(e, i, n) {
      this._exitCallback && this._exitCallback(new l(e, i, n)), t.exit(e);
    }
    /**
     * Register callback `fn` for the command.
     *
     * @example
     * program
     *   .command('serve')
     *   .description('start service')
     *   .action(function() {
     *      // do work here
     *   });
     *
     * @param {Function} fn
     * @return {Command} `this` command for chaining
     */
    action(e) {
      const i = (n) => {
        const h = this.registeredArguments.length, a = n.slice(0, h);
        return this._storeOptionsAsProperties ? a[h] = this : a[h] = this.opts(), a.push(this), e.apply(this, a);
      };
      return this._actionHandler = i, this;
    }
    /**
     * Factory routine to create a new unattached option.
     *
     * See .option() for creating an attached option, which uses this routine to
     * create the option. You can override createOption to return a custom option.
     *
     * @param {string} flags
     * @param {string} [description]
     * @return {Option} new option
     */
    createOption(e, i) {
      return new f(e, i);
    }
    /**
     * Wrap parseArgs to catch 'commander.invalidArgument'.
     *
     * @param {(Option | Argument)} target
     * @param {string} value
     * @param {*} previous
     * @param {string} invalidArgumentMessage
     * @private
     */
    _callParseArg(e, i, n, h) {
      try {
        return e.parseArg(i, n);
      } catch (a) {
        if (a.code === "commander.invalidArgument") {
          const C = `${h} ${a.message}`;
          this.error(C, { exitCode: a.exitCode, code: a.code });
        }
        throw a;
      }
    }
    /**
     * Check for option flag conflicts.
     * Register option if no conflicts found, or throw on conflict.
     *
     * @param {Option} option
     * @private
     */
    _registerOption(e) {
      const i = e.short && this._findOption(e.short) || e.long && this._findOption(e.long);
      if (i) {
        const n = e.long && this._findOption(e.long) ? e.long : e.short;
        throw new Error(`Cannot add option '${e.flags}'${this._name && ` to command '${this._name}'`} due to conflicting flag '${n}'
-  already used by option '${i.flags}'`);
      }
      this.options.push(e);
    }
    /**
     * Check for command name and alias conflicts with existing commands.
     * Register command if no conflicts found, or throw on conflict.
     *
     * @param {Command} command
     * @private
     */
    _registerCommand(e) {
      const i = (h) => [h.name()].concat(h.aliases()), n = i(e).find(
        (h) => this._findCommand(h)
      );
      if (n) {
        const h = i(this._findCommand(n)).join("|"), a = i(e).join("|");
        throw new Error(
          `cannot add command '${a}' as already have command '${h}'`
        );
      }
      this.commands.push(e);
    }
    /**
     * Add an option.
     *
     * @param {Option} option
     * @return {Command} `this` command for chaining
     */
    addOption(e) {
      this._registerOption(e);
      const i = e.name(), n = e.attributeName();
      if (e.negate) {
        const a = e.long.replace(/^--no-/, "--");
        this._findOption(a) || this.setOptionValueWithSource(
          n,
          e.defaultValue === void 0 ? !0 : e.defaultValue,
          "default"
        );
      } else e.defaultValue !== void 0 && this.setOptionValueWithSource(n, e.defaultValue, "default");
      const h = (a, C, E) => {
        a == null && e.presetArg !== void 0 && (a = e.presetArg);
        const m = this.getOptionValue(n);
        a !== null && e.parseArg ? a = this._callParseArg(e, a, m, C) : a !== null && e.variadic && (a = e._concatValue(a, m)), a == null && (e.negate ? a = !1 : e.isBoolean() || e.optional ? a = !0 : a = ""), this.setOptionValueWithSource(n, a, E);
      };
      return this.on("option:" + i, (a) => {
        const C = `error: option '${e.flags}' argument '${a}' is invalid.`;
        h(a, C, "cli");
      }), e.envVar && this.on("optionEnv:" + i, (a) => {
        const C = `error: option '${e.flags}' value '${a}' from env '${e.envVar}' is invalid.`;
        h(a, C, "env");
      }), this;
    }
    /**
     * Internal implementation shared by .option() and .requiredOption()
     *
     * @return {Command} `this` command for chaining
     * @private
     */
    _optionEx(e, i, n, h, a) {
      if (typeof i == "object" && i instanceof f)
        throw new Error(
          "To add an Option object use addOption() instead of option() or requiredOption()"
        );
      const C = this.createOption(i, n);
      if (C.makeOptionMandatory(!!e.mandatory), typeof h == "function")
        C.default(a).argParser(h);
      else if (h instanceof RegExp) {
        const E = h;
        h = (m, _) => {
          const A = E.exec(m);
          return A ? A[0] : _;
        }, C.default(a).argParser(h);
      } else
        C.default(h);
      return this.addOption(C);
    }
    /**
     * Define option with `flags`, `description`, and optional argument parsing function or `defaultValue` or both.
     *
     * The `flags` string contains the short and/or long flags, separated by comma, a pipe or space. A required
     * option-argument is indicated by `<>` and an optional option-argument by `[]`.
     *
     * See the README for more details, and see also addOption() and requiredOption().
     *
     * @example
     * program
     *     .option('-p, --pepper', 'add pepper')
     *     .option('--pt, --pizza-type <TYPE>', 'type of pizza') // required option-argument
     *     .option('-c, --cheese [CHEESE]', 'add extra cheese', 'mozzarella') // optional option-argument with default
     *     .option('-t, --tip <VALUE>', 'add tip to purchase cost', parseFloat) // custom parse function
     *
     * @param {string} flags
     * @param {string} [description]
     * @param {(Function|*)} [parseArg] - custom option processing function or default value
     * @param {*} [defaultValue]
     * @return {Command} `this` command for chaining
     */
    option(e, i, n, h) {
      return this._optionEx({}, e, i, n, h);
    }
    /**
     * Add a required option which must have a value after parsing. This usually means
     * the option must be specified on the command line. (Otherwise the same as .option().)
     *
     * The `flags` string contains the short and/or long flags, separated by comma, a pipe or space.
     *
     * @param {string} flags
     * @param {string} [description]
     * @param {(Function|*)} [parseArg] - custom option processing function or default value
     * @param {*} [defaultValue]
     * @return {Command} `this` command for chaining
     */
    requiredOption(e, i, n, h) {
      return this._optionEx(
        { mandatory: !0 },
        e,
        i,
        n,
        h
      );
    }
    /**
     * Alter parsing of short flags with optional values.
     *
     * @example
     * // for `.option('-f,--flag [value]'):
     * program.combineFlagAndOptionalValue(true);  // `-f80` is treated like `--flag=80`, this is the default behaviour
     * program.combineFlagAndOptionalValue(false) // `-fb` is treated like `-f -b`
     *
     * @param {boolean} [combine] - if `true` or omitted, an optional value can be specified directly after the flag.
     * @return {Command} `this` command for chaining
     */
    combineFlagAndOptionalValue(e = !0) {
      return this._combineFlagAndOptionalValue = !!e, this;
    }
    /**
     * Allow unknown options on the command line.
     *
     * @param {boolean} [allowUnknown] - if `true` or omitted, no error will be thrown for unknown options.
     * @return {Command} `this` command for chaining
     */
    allowUnknownOption(e = !0) {
      return this._allowUnknownOption = !!e, this;
    }
    /**
     * Allow excess command-arguments on the command line. Pass false to make excess arguments an error.
     *
     * @param {boolean} [allowExcess] - if `true` or omitted, no error will be thrown for excess arguments.
     * @return {Command} `this` command for chaining
     */
    allowExcessArguments(e = !0) {
      return this._allowExcessArguments = !!e, this;
    }
    /**
     * Enable positional options. Positional means global options are specified before subcommands which lets
     * subcommands reuse the same option names, and also enables subcommands to turn on passThroughOptions.
     * The default behaviour is non-positional and global options may appear anywhere on the command line.
     *
     * @param {boolean} [positional]
     * @return {Command} `this` command for chaining
     */
    enablePositionalOptions(e = !0) {
      return this._enablePositionalOptions = !!e, this;
    }
    /**
     * Pass through options that come after command-arguments rather than treat them as command-options,
     * so actual command-options come before command-arguments. Turning this on for a subcommand requires
     * positional options to have been enabled on the program (parent commands).
     * The default behaviour is non-positional and options may appear before or after command-arguments.
     *
     * @param {boolean} [passThrough] for unknown options.
     * @return {Command} `this` command for chaining
     */
    passThroughOptions(e = !0) {
      return this._passThroughOptions = !!e, this._checkForBrokenPassThrough(), this;
    }
    /**
     * @private
     */
    _checkForBrokenPassThrough() {
      if (this.parent && this._passThroughOptions && !this.parent._enablePositionalOptions)
        throw new Error(
          `passThroughOptions cannot be used for '${this._name}' without turning on enablePositionalOptions for parent command(s)`
        );
    }
    /**
     * Whether to store option values as properties on command object,
     * or store separately (specify false). In both cases the option values can be accessed using .opts().
     *
     * @param {boolean} [storeAsProperties=true]
     * @return {Command} `this` command for chaining
     */
    storeOptionsAsProperties(e = !0) {
      if (this.options.length)
        throw new Error("call .storeOptionsAsProperties() before adding options");
      if (Object.keys(this._optionValues).length)
        throw new Error(
          "call .storeOptionsAsProperties() before setting option values"
        );
      return this._storeOptionsAsProperties = !!e, this;
    }
    /**
     * Retrieve option value.
     *
     * @param {string} key
     * @return {object} value
     */
    getOptionValue(e) {
      return this._storeOptionsAsProperties ? this[e] : this._optionValues[e];
    }
    /**
     * Store option value.
     *
     * @param {string} key
     * @param {object} value
     * @return {Command} `this` command for chaining
     */
    setOptionValue(e, i) {
      return this.setOptionValueWithSource(e, i, void 0);
    }
    /**
     * Store option value and where the value came from.
     *
     * @param {string} key
     * @param {object} value
     * @param {string} source - expected values are default/config/env/cli/implied
     * @return {Command} `this` command for chaining
     */
    setOptionValueWithSource(e, i, n) {
      return this._storeOptionsAsProperties ? this[e] = i : this._optionValues[e] = i, this._optionValueSources[e] = n, this;
    }
    /**
     * Get source of option value.
     * Expected values are default | config | env | cli | implied
     *
     * @param {string} key
     * @return {string}
     */
    getOptionValueSource(e) {
      return this._optionValueSources[e];
    }
    /**
     * Get source of option value. See also .optsWithGlobals().
     * Expected values are default | config | env | cli | implied
     *
     * @param {string} key
     * @return {string}
     */
    getOptionValueSourceWithGlobals(e) {
      let i;
      return this._getCommandAndAncestors().forEach((n) => {
        n.getOptionValueSource(e) !== void 0 && (i = n.getOptionValueSource(e));
      }), i;
    }
    /**
     * Get user arguments from implied or explicit arguments.
     * Side-effects: set _scriptPath if args included script. Used for default program name, and subcommand searches.
     *
     * @private
     */
    _prepareUserArgs(e, i) {
      if (e !== void 0 && !Array.isArray(e))
        throw new Error("first parameter to parse must be array or undefined");
      if (i = i || {}, e === void 0 && i.from === void 0) {
        t.versions?.electron && (i.from = "electron");
        const h = t.execArgv ?? [];
        (h.includes("-e") || h.includes("--eval") || h.includes("-p") || h.includes("--print")) && (i.from = "eval");
      }
      e === void 0 && (e = t.argv), this.rawArgs = e.slice();
      let n;
      switch (i.from) {
        case void 0:
        case "node":
          this._scriptPath = e[1], n = e.slice(2);
          break;
        case "electron":
          t.defaultApp ? (this._scriptPath = e[1], n = e.slice(2)) : n = e.slice(1);
          break;
        case "user":
          n = e.slice(0);
          break;
        case "eval":
          n = e.slice(1);
          break;
        default:
          throw new Error(
            `unexpected parse option { from: '${i.from}' }`
          );
      }
      return !this._name && this._scriptPath && this.nameFromFilename(this._scriptPath), this._name = this._name || "program", n;
    }
    /**
     * Parse `argv`, setting options and invoking commands when defined.
     *
     * Use parseAsync instead of parse if any of your action handlers are async.
     *
     * Call with no parameters to parse `process.argv`. Detects Electron and special node options like `node --eval`. Easy mode!
     *
     * Or call with an array of strings to parse, and optionally where the user arguments start by specifying where the arguments are `from`:
     * - `'node'`: default, `argv[0]` is the application and `argv[1]` is the script being run, with user arguments after that
     * - `'electron'`: `argv[0]` is the application and `argv[1]` varies depending on whether the electron application is packaged
     * - `'user'`: just user arguments
     *
     * @example
     * program.parse(); // parse process.argv and auto-detect electron and special node flags
     * program.parse(process.argv); // assume argv[0] is app and argv[1] is script
     * program.parse(my-args, { from: 'user' }); // just user supplied arguments, nothing special about argv[0]
     *
     * @param {string[]} [argv] - optional, defaults to process.argv
     * @param {object} [parseOptions] - optionally specify style of options with from: node/user/electron
     * @param {string} [parseOptions.from] - where the args are from: 'node', 'user', 'electron'
     * @return {Command} `this` command for chaining
     */
    parse(e, i) {
      this._prepareForParse();
      const n = this._prepareUserArgs(e, i);
      return this._parseCommand([], n), this;
    }
    /**
     * Parse `argv`, setting options and invoking commands when defined.
     *
     * Call with no parameters to parse `process.argv`. Detects Electron and special node options like `node --eval`. Easy mode!
     *
     * Or call with an array of strings to parse, and optionally where the user arguments start by specifying where the arguments are `from`:
     * - `'node'`: default, `argv[0]` is the application and `argv[1]` is the script being run, with user arguments after that
     * - `'electron'`: `argv[0]` is the application and `argv[1]` varies depending on whether the electron application is packaged
     * - `'user'`: just user arguments
     *
     * @example
     * await program.parseAsync(); // parse process.argv and auto-detect electron and special node flags
     * await program.parseAsync(process.argv); // assume argv[0] is app and argv[1] is script
     * await program.parseAsync(my-args, { from: 'user' }); // just user supplied arguments, nothing special about argv[0]
     *
     * @param {string[]} [argv]
     * @param {object} [parseOptions]
     * @param {string} parseOptions.from - where the args are from: 'node', 'user', 'electron'
     * @return {Promise}
     */
    async parseAsync(e, i) {
      this._prepareForParse();
      const n = this._prepareUserArgs(e, i);
      return await this._parseCommand([], n), this;
    }
    _prepareForParse() {
      this._savedState === null ? this.saveStateBeforeParse() : this.restoreStateBeforeParse();
    }
    /**
     * Called the first time parse is called to save state and allow a restore before subsequent calls to parse.
     * Not usually called directly, but available for subclasses to save their custom state.
     *
     * This is called in a lazy way. Only commands used in parsing chain will have state saved.
     */
    saveStateBeforeParse() {
      this._savedState = {
        // name is stable if supplied by author, but may be unspecified for root command and deduced during parsing
        _name: this._name,
        // option values before parse have default values (including false for negated options)
        // shallow clones
        _optionValues: { ...this._optionValues },
        _optionValueSources: { ...this._optionValueSources }
      };
    }
    /**
     * Restore state before parse for calls after the first.
     * Not usually called directly, but available for subclasses to save their custom state.
     *
     * This is called in a lazy way. Only commands used in parsing chain will have state restored.
     */
    restoreStateBeforeParse() {
      if (this._storeOptionsAsProperties)
        throw new Error(`Can not call parse again when storeOptionsAsProperties is true.
- either make a new Command for each call to parse, or stop storing options as properties`);
      this._name = this._savedState._name, this._scriptPath = null, this.rawArgs = [], this._optionValues = { ...this._savedState._optionValues }, this._optionValueSources = { ...this._savedState._optionValueSources }, this.args = [], this.processedArgs = [];
    }
    /**
     * Throw if expected executable is missing. Add lots of help for author.
     *
     * @param {string} executableFile
     * @param {string} executableDir
     * @param {string} subcommandName
     */
    _checkForMissingExecutable(e, i, n) {
      if (c.existsSync(e)) return;
      const h = i ? `searched for local subcommand relative to directory '${i}'` : "no directory for search for local subcommand, use .executableDir() to supply a custom directory", a = `'${e}' does not exist
 - if '${n}' is not meant to be an executable command, remove description parameter from '.command()' and use '.description()' instead
 - if the default executable name is not suitable, use the executableFile option to supply a custom name or path
 - ${h}`;
      throw new Error(a);
    }
    /**
     * Execute a sub-command executable.
     *
     * @private
     */
    _executeSubCommand(e, i) {
      i = i.slice();
      let n = !1;
      const h = [".js", ".ts", ".tsx", ".mjs", ".cjs"];
      function a(A, $) {
        const W = o.resolve(A, $);
        if (c.existsSync(W)) return W;
        if (h.includes(o.extname($))) return;
        const ru = h.find(
          (Mu) => c.existsSync(`${W}${Mu}`)
        );
        if (ru) return `${W}${ru}`;
      }
      this._checkForMissingMandatoryOptions(), this._checkForConflictingOptions();
      let C = e._executableFile || `${this._name}-${e._name}`, E = this._executableDir || "";
      if (this._scriptPath) {
        let A;
        try {
          A = c.realpathSync(this._scriptPath);
        } catch {
          A = this._scriptPath;
        }
        E = o.resolve(
          o.dirname(A),
          E
        );
      }
      if (E) {
        let A = a(E, C);
        if (!A && !e._executableFile && this._scriptPath) {
          const $ = o.basename(
            this._scriptPath,
            o.extname(this._scriptPath)
          );
          $ !== this._name && (A = a(
            E,
            `${$}-${e._name}`
          ));
        }
        C = A || C;
      }
      n = h.includes(o.extname(C));
      let m;
      t.platform !== "win32" ? n ? (i.unshift(C), i = b(t.execArgv).concat(i), m = s.spawn(t.argv[0], i, { stdio: "inherit" })) : m = s.spawn(C, i, { stdio: "inherit" }) : (this._checkForMissingExecutable(
        C,
        E,
        e._name
      ), i.unshift(C), i = b(t.execArgv).concat(i), m = s.spawn(t.execPath, i, { stdio: "inherit" })), m.killed || ["SIGUSR1", "SIGUSR2", "SIGTERM", "SIGINT", "SIGHUP"].forEach(($) => {
        t.on($, () => {
          m.killed === !1 && m.exitCode === null && m.kill($);
        });
      });
      const _ = this._exitCallback;
      m.on("close", (A) => {
        A = A ?? 1, _ ? _(
          new l(
            A,
            "commander.executeSubCommandAsync",
            "(close)"
          )
        ) : t.exit(A);
      }), m.on("error", (A) => {
        if (A.code === "ENOENT")
          this._checkForMissingExecutable(
            C,
            E,
            e._name
          );
        else if (A.code === "EACCES")
          throw new Error(`'${C}' not executable`);
        if (!_)
          t.exit(1);
        else {
          const $ = new l(
            1,
            "commander.executeSubCommandAsync",
            "(error)"
          );
          $.nestedError = A, _($);
        }
      }), this.runningCommand = m;
    }
    /**
     * @private
     */
    _dispatchSubcommand(e, i, n) {
      const h = this._findCommand(e);
      h || this.help({ error: !0 }), h._prepareForParse();
      let a;
      return a = this._chainOrCallSubCommandHook(
        a,
        h,
        "preSubcommand"
      ), a = this._chainOrCall(a, () => {
        if (h._executableHandler)
          this._executeSubCommand(h, i.concat(n));
        else
          return h._parseCommand(i, n);
      }), a;
    }
    /**
     * Invoke help directly if possible, or dispatch if necessary.
     * e.g. help foo
     *
     * @private
     */
    _dispatchHelpCommand(e) {
      e || this.help();
      const i = this._findCommand(e);
      return i && !i._executableHandler && i.help(), this._dispatchSubcommand(
        e,
        [],
        [this._getHelpOption()?.long ?? this._getHelpOption()?.short ?? "--help"]
      );
    }
    /**
     * Check this.args against expected this.registeredArguments.
     *
     * @private
     */
    _checkNumberOfArguments() {
      this.registeredArguments.forEach((e, i) => {
        e.required && this.args[i] == null && this.missingArgument(e.name());
      }), !(this.registeredArguments.length > 0 && this.registeredArguments[this.registeredArguments.length - 1].variadic) && this.args.length > this.registeredArguments.length && this._excessArguments(this.args);
    }
    /**
     * Process this.args using this.registeredArguments and save as this.processedArgs!
     *
     * @private
     */
    _processArguments() {
      const e = (n, h, a) => {
        let C = h;
        if (h !== null && n.parseArg) {
          const E = `error: command-argument value '${h}' is invalid for argument '${n.name()}'.`;
          C = this._callParseArg(
            n,
            h,
            a,
            E
          );
        }
        return C;
      };
      this._checkNumberOfArguments();
      const i = [];
      this.registeredArguments.forEach((n, h) => {
        let a = n.defaultValue;
        n.variadic ? h < this.args.length ? (a = this.args.slice(h), n.parseArg && (a = a.reduce((C, E) => e(n, E, C), n.defaultValue))) : a === void 0 && (a = []) : h < this.args.length && (a = this.args[h], n.parseArg && (a = e(n, a, n.defaultValue))), i[h] = a;
      }), this.processedArgs = i;
    }
    /**
     * Once we have a promise we chain, but call synchronously until then.
     *
     * @param {(Promise|undefined)} promise
     * @param {Function} fn
     * @return {(Promise|undefined)}
     * @private
     */
    _chainOrCall(e, i) {
      return e && e.then && typeof e.then == "function" ? e.then(() => i()) : i();
    }
    /**
     *
     * @param {(Promise|undefined)} promise
     * @param {string} event
     * @return {(Promise|undefined)}
     * @private
     */
    _chainOrCallHooks(e, i) {
      let n = e;
      const h = [];
      return this._getCommandAndAncestors().reverse().filter((a) => a._lifeCycleHooks[i] !== void 0).forEach((a) => {
        a._lifeCycleHooks[i].forEach((C) => {
          h.push({ hookedCommand: a, callback: C });
        });
      }), i === "postAction" && h.reverse(), h.forEach((a) => {
        n = this._chainOrCall(n, () => a.callback(a.hookedCommand, this));
      }), n;
    }
    /**
     *
     * @param {(Promise|undefined)} promise
     * @param {Command} subCommand
     * @param {string} event
     * @return {(Promise|undefined)}
     * @private
     */
    _chainOrCallSubCommandHook(e, i, n) {
      let h = e;
      return this._lifeCycleHooks[n] !== void 0 && this._lifeCycleHooks[n].forEach((a) => {
        h = this._chainOrCall(h, () => a(this, i));
      }), h;
    }
    /**
     * Process arguments in context of this command.
     * Returns action result, in case it is a promise.
     *
     * @private
     */
    _parseCommand(e, i) {
      const n = this.parseOptions(i);
      if (this._parseOptionsEnv(), this._parseOptionsImplied(), e = e.concat(n.operands), i = n.unknown, this.args = e.concat(i), e && this._findCommand(e[0]))
        return this._dispatchSubcommand(e[0], e.slice(1), i);
      if (this._getHelpCommand() && e[0] === this._getHelpCommand().name())
        return this._dispatchHelpCommand(e[1]);
      if (this._defaultCommandName)
        return this._outputHelpIfRequested(i), this._dispatchSubcommand(
          this._defaultCommandName,
          e,
          i
        );
      this.commands.length && this.args.length === 0 && !this._actionHandler && !this._defaultCommandName && this.help({ error: !0 }), this._outputHelpIfRequested(n.unknown), this._checkForMissingMandatoryOptions(), this._checkForConflictingOptions();
      const h = () => {
        n.unknown.length > 0 && this.unknownOption(n.unknown[0]);
      }, a = `command:${this.name()}`;
      if (this._actionHandler) {
        h(), this._processArguments();
        let C;
        return C = this._chainOrCallHooks(C, "preAction"), C = this._chainOrCall(
          C,
          () => this._actionHandler(this.processedArgs)
        ), this.parent && (C = this._chainOrCall(C, () => {
          this.parent.emit(a, e, i);
        })), C = this._chainOrCallHooks(C, "postAction"), C;
      }
      if (this.parent && this.parent.listenerCount(a))
        h(), this._processArguments(), this.parent.emit(a, e, i);
      else if (e.length) {
        if (this._findCommand("*"))
          return this._dispatchSubcommand("*", e, i);
        this.listenerCount("command:*") ? this.emit("command:*", e, i) : this.commands.length ? this.unknownCommand() : (h(), this._processArguments());
      } else this.commands.length ? (h(), this.help({ error: !0 })) : (h(), this._processArguments());
    }
    /**
     * Find matching command.
     *
     * @private
     * @return {Command | undefined}
     */
    _findCommand(e) {
      if (e)
        return this.commands.find(
          (i) => i._name === e || i._aliases.includes(e)
        );
    }
    /**
     * Return an option matching `arg` if any.
     *
     * @param {string} arg
     * @return {Option}
     * @package
     */
    _findOption(e) {
      return this.options.find((i) => i.is(e));
    }
    /**
     * Display an error message if a mandatory option does not have a value.
     * Called after checking for help flags in leaf subcommand.
     *
     * @private
     */
    _checkForMissingMandatoryOptions() {
      this._getCommandAndAncestors().forEach((e) => {
        e.options.forEach((i) => {
          i.mandatory && e.getOptionValue(i.attributeName()) === void 0 && e.missingMandatoryOptionValue(i);
        });
      });
    }
    /**
     * Display an error message if conflicting options are used together in this.
     *
     * @private
     */
    _checkForConflictingLocalOptions() {
      const e = this.options.filter((n) => {
        const h = n.attributeName();
        return this.getOptionValue(h) === void 0 ? !1 : this.getOptionValueSource(h) !== "default";
      });
      e.filter(
        (n) => n.conflictsWith.length > 0
      ).forEach((n) => {
        const h = e.find(
          (a) => n.conflictsWith.includes(a.attributeName())
        );
        h && this._conflictingOption(n, h);
      });
    }
    /**
     * Display an error message if conflicting options are used together.
     * Called after checking for help flags in leaf subcommand.
     *
     * @private
     */
    _checkForConflictingOptions() {
      this._getCommandAndAncestors().forEach((e) => {
        e._checkForConflictingLocalOptions();
      });
    }
    /**
     * Parse options from `argv` removing known options,
     * and return argv split into operands and unknown arguments.
     *
     * Side effects: modifies command by storing options. Does not reset state if called again.
     *
     * Examples:
     *
     *     argv => operands, unknown
     *     --known kkk op => [op], []
     *     op --known kkk => [op], []
     *     sub --unknown uuu op => [sub], [--unknown uuu op]
     *     sub -- --unknown uuu op => [sub --unknown uuu op], []
     *
     * @param {string[]} argv
     * @return {{operands: string[], unknown: string[]}}
     */
    parseOptions(e) {
      const i = [], n = [];
      let h = i;
      const a = e.slice();
      function C(m) {
        return m.length > 1 && m[0] === "-";
      }
      let E = null;
      for (; a.length; ) {
        const m = a.shift();
        if (m === "--") {
          h === n && h.push(m), h.push(...a);
          break;
        }
        if (E && !C(m)) {
          this.emit(`option:${E.name()}`, m);
          continue;
        }
        if (E = null, C(m)) {
          const _ = this._findOption(m);
          if (_) {
            if (_.required) {
              const A = a.shift();
              A === void 0 && this.optionMissingArgument(_), this.emit(`option:${_.name()}`, A);
            } else if (_.optional) {
              let A = null;
              a.length > 0 && !C(a[0]) && (A = a.shift()), this.emit(`option:${_.name()}`, A);
            } else
              this.emit(`option:${_.name()}`);
            E = _.variadic ? _ : null;
            continue;
          }
        }
        if (m.length > 2 && m[0] === "-" && m[1] !== "-") {
          const _ = this._findOption(`-${m[1]}`);
          if (_) {
            _.required || _.optional && this._combineFlagAndOptionalValue ? this.emit(`option:${_.name()}`, m.slice(2)) : (this.emit(`option:${_.name()}`), a.unshift(`-${m.slice(2)}`));
            continue;
          }
        }
        if (/^--[^=]+=/.test(m)) {
          const _ = m.indexOf("="), A = this._findOption(m.slice(0, _));
          if (A && (A.required || A.optional)) {
            this.emit(`option:${A.name()}`, m.slice(_ + 1));
            continue;
          }
        }
        if (C(m) && (h = n), (this._enablePositionalOptions || this._passThroughOptions) && i.length === 0 && n.length === 0) {
          if (this._findCommand(m)) {
            i.push(m), a.length > 0 && n.push(...a);
            break;
          } else if (this._getHelpCommand() && m === this._getHelpCommand().name()) {
            i.push(m), a.length > 0 && i.push(...a);
            break;
          } else if (this._defaultCommandName) {
            n.push(m), a.length > 0 && n.push(...a);
            break;
          }
        }
        if (this._passThroughOptions) {
          h.push(m), a.length > 0 && h.push(...a);
          break;
        }
        h.push(m);
      }
      return { operands: i, unknown: n };
    }
    /**
     * Return an object containing local option values as key-value pairs.
     *
     * @return {object}
     */
    opts() {
      if (this._storeOptionsAsProperties) {
        const e = {}, i = this.options.length;
        for (let n = 0; n < i; n++) {
          const h = this.options[n].attributeName();
          e[h] = h === this._versionOptionName ? this._version : this[h];
        }
        return e;
      }
      return this._optionValues;
    }
    /**
     * Return an object containing merged local and global option values as key-value pairs.
     *
     * @return {object}
     */
    optsWithGlobals() {
      return this._getCommandAndAncestors().reduce(
        (e, i) => Object.assign(e, i.opts()),
        {}
      );
    }
    /**
     * Display error message and exit (or call exitOverride).
     *
     * @param {string} message
     * @param {object} [errorOptions]
     * @param {string} [errorOptions.code] - an id string representing the error
     * @param {number} [errorOptions.exitCode] - used with process.exit
     */
    error(e, i) {
      this._outputConfiguration.outputError(
        `${e}
`,
        this._outputConfiguration.writeErr
      ), typeof this._showHelpAfterError == "string" ? this._outputConfiguration.writeErr(`${this._showHelpAfterError}
`) : this._showHelpAfterError && (this._outputConfiguration.writeErr(`
`), this.outputHelp({ error: !0 }));
      const n = i || {}, h = n.exitCode || 1, a = n.code || "commander.error";
      this._exit(h, a, e);
    }
    /**
     * Apply any option related environment variables, if option does
     * not have a value from cli or client code.
     *
     * @private
     */
    _parseOptionsEnv() {
      this.options.forEach((e) => {
        if (e.envVar && e.envVar in t.env) {
          const i = e.attributeName();
          (this.getOptionValue(i) === void 0 || ["default", "config", "env"].includes(
            this.getOptionValueSource(i)
          )) && (e.required || e.optional ? this.emit(`optionEnv:${e.name()}`, t.env[e.envVar]) : this.emit(`optionEnv:${e.name()}`));
        }
      });
    }
    /**
     * Apply any implied option values, if option is undefined or default value.
     *
     * @private
     */
    _parseOptionsImplied() {
      const e = new g(this.options), i = (n) => this.getOptionValue(n) !== void 0 && !["default", "implied"].includes(this.getOptionValueSource(n));
      this.options.filter(
        (n) => n.implied !== void 0 && i(n.attributeName()) && e.valueFromOption(
          this.getOptionValue(n.attributeName()),
          n
        )
      ).forEach((n) => {
        Object.keys(n.implied).filter((h) => !i(h)).forEach((h) => {
          this.setOptionValueWithSource(
            h,
            n.implied[h],
            "implied"
          );
        });
      });
    }
    /**
     * Argument `name` is missing.
     *
     * @param {string} name
     * @private
     */
    missingArgument(e) {
      const i = `error: missing required argument '${e}'`;
      this.error(i, { code: "commander.missingArgument" });
    }
    /**
     * `Option` is missing an argument.
     *
     * @param {Option} option
     * @private
     */
    optionMissingArgument(e) {
      const i = `error: option '${e.flags}' argument missing`;
      this.error(i, { code: "commander.optionMissingArgument" });
    }
    /**
     * `Option` does not have a value, and is a mandatory option.
     *
     * @param {Option} option
     * @private
     */
    missingMandatoryOptionValue(e) {
      const i = `error: required option '${e.flags}' not specified`;
      this.error(i, { code: "commander.missingMandatoryOptionValue" });
    }
    /**
     * `Option` conflicts with another option.
     *
     * @param {Option} option
     * @param {Option} conflictingOption
     * @private
     */
    _conflictingOption(e, i) {
      const n = (C) => {
        const E = C.attributeName(), m = this.getOptionValue(E), _ = this.options.find(
          ($) => $.negate && E === $.attributeName()
        ), A = this.options.find(
          ($) => !$.negate && E === $.attributeName()
        );
        return _ && (_.presetArg === void 0 && m === !1 || _.presetArg !== void 0 && m === _.presetArg) ? _ : A || C;
      }, h = (C) => {
        const E = n(C), m = E.attributeName();
        return this.getOptionValueSource(m) === "env" ? `environment variable '${E.envVar}'` : `option '${E.flags}'`;
      }, a = `error: ${h(e)} cannot be used with ${h(i)}`;
      this.error(a, { code: "commander.conflictingOption" });
    }
    /**
     * Unknown option `flag`.
     *
     * @param {string} flag
     * @private
     */
    unknownOption(e) {
      if (this._allowUnknownOption) return;
      let i = "";
      if (e.startsWith("--") && this._showSuggestionAfterError) {
        let h = [], a = this;
        do {
          const C = a.createHelp().visibleOptions(a).filter((E) => E.long).map((E) => E.long);
          h = h.concat(C), a = a.parent;
        } while (a && !a._enablePositionalOptions);
        i = B(e, h);
      }
      const n = `error: unknown option '${e}'${i}`;
      this.error(n, { code: "commander.unknownOption" });
    }
    /**
     * Excess arguments, more than expected.
     *
     * @param {string[]} receivedArgs
     * @private
     */
    _excessArguments(e) {
      if (this._allowExcessArguments) return;
      const i = this.registeredArguments.length, n = i === 1 ? "" : "s", a = `error: too many arguments${this.parent ? ` for '${this.name()}'` : ""}. Expected ${i} argument${n} but got ${e.length}.`;
      this.error(a, { code: "commander.excessArguments" });
    }
    /**
     * Unknown command.
     *
     * @private
     */
    unknownCommand() {
      const e = this.args[0];
      let i = "";
      if (this._showSuggestionAfterError) {
        const h = [];
        this.createHelp().visibleCommands(this).forEach((a) => {
          h.push(a.name()), a.alias() && h.push(a.alias());
        }), i = B(e, h);
      }
      const n = `error: unknown command '${e}'${i}`;
      this.error(n, { code: "commander.unknownCommand" });
    }
    /**
     * Get or set the program version.
     *
     * This method auto-registers the "-V, --version" option which will print the version number.
     *
     * You can optionally supply the flags and description to override the defaults.
     *
     * @param {string} [str]
     * @param {string} [flags]
     * @param {string} [description]
     * @return {(this | string | undefined)} `this` command for chaining, or version string if no arguments
     */
    version(e, i, n) {
      if (e === void 0) return this._version;
      this._version = e, i = i || "-V, --version", n = n || "output the version number";
      const h = this.createOption(i, n);
      return this._versionOptionName = h.attributeName(), this._registerOption(h), this.on("option:" + h.name(), () => {
        this._outputConfiguration.writeOut(`${e}
`), this._exit(0, "commander.version", e);
      }), this;
    }
    /**
     * Set the description.
     *
     * @param {string} [str]
     * @param {object} [argsDescription]
     * @return {(string|Command)}
     */
    description(e, i) {
      return e === void 0 && i === void 0 ? this._description : (this._description = e, i && (this._argsDescription = i), this);
    }
    /**
     * Set the summary. Used when listed as subcommand of parent.
     *
     * @param {string} [str]
     * @return {(string|Command)}
     */
    summary(e) {
      return e === void 0 ? this._summary : (this._summary = e, this);
    }
    /**
     * Set an alias for the command.
     *
     * You may call more than once to add multiple aliases. Only the first alias is shown in the auto-generated help.
     *
     * @param {string} [alias]
     * @return {(string|Command)}
     */
    alias(e) {
      if (e === void 0) return this._aliases[0];
      let i = this;
      if (this.commands.length !== 0 && this.commands[this.commands.length - 1]._executableHandler && (i = this.commands[this.commands.length - 1]), e === i._name)
        throw new Error("Command alias can't be the same as its name");
      const n = this.parent?._findCommand(e);
      if (n) {
        const h = [n.name()].concat(n.aliases()).join("|");
        throw new Error(
          `cannot add alias '${e}' to command '${this.name()}' as already have command '${h}'`
        );
      }
      return i._aliases.push(e), this;
    }
    /**
     * Set aliases for the command.
     *
     * Only the first alias is shown in the auto-generated help.
     *
     * @param {string[]} [aliases]
     * @return {(string[]|Command)}
     */
    aliases(e) {
      return e === void 0 ? this._aliases : (e.forEach((i) => this.alias(i)), this);
    }
    /**
     * Set / get the command usage `str`.
     *
     * @param {string} [str]
     * @return {(string|Command)}
     */
    usage(e) {
      if (e === void 0) {
        if (this._usage) return this._usage;
        const i = this.registeredArguments.map((n) => u(n));
        return [].concat(
          this.options.length || this._helpOption !== null ? "[options]" : [],
          this.commands.length ? "[command]" : [],
          this.registeredArguments.length ? i : []
        ).join(" ");
      }
      return this._usage = e, this;
    }
    /**
     * Get or set the name of the command.
     *
     * @param {string} [str]
     * @return {(string|Command)}
     */
    name(e) {
      return e === void 0 ? this._name : (this._name = e, this);
    }
    /**
     * Set the name of the command from script filename, such as process.argv[1],
     * or require.main.filename, or __filename.
     *
     * (Used internally and public although not documented in README.)
     *
     * @example
     * program.nameFromFilename(require.main.filename);
     *
     * @param {string} filename
     * @return {Command}
     */
    nameFromFilename(e) {
      return this._name = o.basename(e, o.extname(e)), this;
    }
    /**
     * Get or set the directory for searching for executable subcommands of this command.
     *
     * @example
     * program.executableDir(__dirname);
     * // or
     * program.executableDir('subcommands');
     *
     * @param {string} [path]
     * @return {(string|null|Command)}
     */
    executableDir(e) {
      return e === void 0 ? this._executableDir : (this._executableDir = e, this);
    }
    /**
     * Return program help documentation.
     *
     * @param {{ error: boolean }} [contextOptions] - pass {error:true} to wrap for stderr instead of stdout
     * @return {string}
     */
    helpInformation(e) {
      const i = this.createHelp(), n = this._getOutputContext(e);
      i.prepareContext({
        error: n.error,
        helpWidth: n.helpWidth,
        outputHasColors: n.hasColors
      });
      const h = i.formatHelp(this, i);
      return n.hasColors ? h : this._outputConfiguration.stripColor(h);
    }
    /**
     * @typedef HelpContext
     * @type {object}
     * @property {boolean} error
     * @property {number} helpWidth
     * @property {boolean} hasColors
     * @property {function} write - includes stripColor if needed
     *
     * @returns {HelpContext}
     * @private
     */
    _getOutputContext(e) {
      e = e || {};
      const i = !!e.error;
      let n, h, a;
      return i ? (n = (E) => this._outputConfiguration.writeErr(E), h = this._outputConfiguration.getErrHasColors(), a = this._outputConfiguration.getErrHelpWidth()) : (n = (E) => this._outputConfiguration.writeOut(E), h = this._outputConfiguration.getOutHasColors(), a = this._outputConfiguration.getOutHelpWidth()), { error: i, write: (E) => (h || (E = this._outputConfiguration.stripColor(E)), n(E)), hasColors: h, helpWidth: a };
    }
    /**
     * Output help information for this command.
     *
     * Outputs built-in help, and custom text added using `.addHelpText()`.
     *
     * @param {{ error: boolean } | Function} [contextOptions] - pass {error:true} to write to stderr instead of stdout
     */
    outputHelp(e) {
      let i;
      typeof e == "function" && (i = e, e = void 0);
      const n = this._getOutputContext(e), h = {
        error: n.error,
        write: n.write,
        command: this
      };
      this._getCommandAndAncestors().reverse().forEach((C) => C.emit("beforeAllHelp", h)), this.emit("beforeHelp", h);
      let a = this.helpInformation({ error: n.error });
      if (i && (a = i(a), typeof a != "string" && !Buffer.isBuffer(a)))
        throw new Error("outputHelp callback must return a string or a Buffer");
      n.write(a), this._getHelpOption()?.long && this.emit(this._getHelpOption().long), this.emit("afterHelp", h), this._getCommandAndAncestors().forEach(
        (C) => C.emit("afterAllHelp", h)
      );
    }
    /**
     * You can pass in flags and a description to customise the built-in help option.
     * Pass in false to disable the built-in help option.
     *
     * @example
     * program.helpOption('-?, --help' 'show help'); // customise
     * program.helpOption(false); // disable
     *
     * @param {(string | boolean)} flags
     * @param {string} [description]
     * @return {Command} `this` command for chaining
     */
    helpOption(e, i) {
      return typeof e == "boolean" ? (e ? this._helpOption = this._helpOption ?? void 0 : this._helpOption = null, this) : (e = e ?? "-h, --help", i = i ?? "display help for command", this._helpOption = this.createOption(e, i), this);
    }
    /**
     * Lazy create help option.
     * Returns null if has been disabled with .helpOption(false).
     *
     * @returns {(Option | null)} the help option
     * @package
     */
    _getHelpOption() {
      return this._helpOption === void 0 && this.helpOption(void 0, void 0), this._helpOption;
    }
    /**
     * Supply your own option to use for the built-in help option.
     * This is an alternative to using helpOption() to customise the flags and description etc.
     *
     * @param {Option} option
     * @return {Command} `this` command for chaining
     */
    addHelpOption(e) {
      return this._helpOption = e, this;
    }
    /**
     * Output help information and exit.
     *
     * Outputs built-in help, and custom text added using `.addHelpText()`.
     *
     * @param {{ error: boolean }} [contextOptions] - pass {error:true} to write to stderr instead of stdout
     */
    help(e) {
      this.outputHelp(e);
      let i = Number(t.exitCode ?? 0);
      i === 0 && e && typeof e != "function" && e.error && (i = 1), this._exit(i, "commander.help", "(outputHelp)");
    }
    /**
     * // Do a little typing to coordinate emit and listener for the help text events.
     * @typedef HelpTextEventContext
     * @type {object}
     * @property {boolean} error
     * @property {Command} command
     * @property {function} write
     */
    /**
     * Add additional text to be displayed with the built-in help.
     *
     * Position is 'before' or 'after' to affect just this command,
     * and 'beforeAll' or 'afterAll' to affect this command and all its subcommands.
     *
     * @param {string} position - before or after built-in help
     * @param {(string | Function)} text - string to add, or a function returning a string
     * @return {Command} `this` command for chaining
     */
    addHelpText(e, i) {
      const n = ["beforeAll", "before", "after", "afterAll"];
      if (!n.includes(e))
        throw new Error(`Unexpected value for position to addHelpText.
Expecting one of '${n.join("', '")}'`);
      const h = `${e}Help`;
      return this.on(h, (a) => {
        let C;
        typeof i == "function" ? C = i({ error: a.error, command: a.command }) : C = i, C && a.write(`${C}
`);
      }), this;
    }
    /**
     * Output help information if help flags specified
     *
     * @param {Array} args - array of options to search for help flags
     * @private
     */
    _outputHelpIfRequested(e) {
      const i = this._getHelpOption();
      i && e.find((h) => i.is(h)) && (this.outputHelp(), this._exit(0, "commander.helpDisplayed", "(outputHelp)"));
    }
  }
  function b(Wu) {
    return Wu.map((e) => {
      if (!e.startsWith("--inspect"))
        return e;
      let i, n = "127.0.0.1", h = "9229", a;
      return (a = e.match(/^(--inspect(-brk)?)$/)) !== null ? i = a[1] : (a = e.match(/^(--inspect(-brk|-port)?)=([^:]+)$/)) !== null ? (i = a[1], /^\d+$/.test(a[3]) ? h = a[3] : n = a[3]) : (a = e.match(/^(--inspect(-brk|-port)?)=([^:]+):(\d+)$/)) !== null && (i = a[1], n = a[3], h = a[4]), i && h !== "0" ? `${i}=${n}:${parseInt(h) + 1}` : e;
    });
  }
  function T() {
    if (t.env.NO_COLOR || t.env.FORCE_COLOR === "0" || t.env.FORCE_COLOR === "false")
      return !1;
    if (t.env.FORCE_COLOR || t.env.CLICOLOR_FORCE !== void 0)
      return !0;
  }
  return j.Command = v, j.useColor = T, j;
}
var pu;
function zu() {
  if (pu) return y;
  pu = 1;
  const { Argument: r } = tu(), { Command: s } = Ku(), { CommanderError: o, InvalidArgumentError: c } = K(), { Help: t } = vu(), { Option: D } = $u();
  return y.program = new s(), y.createCommand = (u) => new s(u), y.createOption = (u, l) => new D(u, l), y.createArgument = (u, l) => new r(u, l), y.Command = s, y.Option = D, y.Argument = r, y.Help = t, y.CommanderError = o, y.InvalidArgumentError = c, y.InvalidOptionArgumentError = c, y;
}
var Ju = zu();
const Yu = /* @__PURE__ */ Ou(Ju), {
  program: iu,
  createCommand: Je,
  createArgument: Ye,
  createOption: Ze,
  CommanderError: Qe,
  InvalidArgumentError: Xe,
  InvalidOptionArgumentError: ut,
  // deprecated old name
  Command: Zu,
  Argument: et,
  Option: tt,
  Help: it
} = Yu;
var Y, Fu;
function Qu() {
  if (Fu) return Y;
  Fu = 1;
  const r = "\x1B", s = `${r}[`, o = "\x07", c = {
    to(u, l) {
      return l ? `${s}${l + 1};${u + 1}H` : `${s}${u + 1}G`;
    },
    move(u, l) {
      let p = "";
      return u < 0 ? p += `${s}${-u}D` : u > 0 && (p += `${s}${u}C`), l < 0 ? p += `${s}${-l}A` : l > 0 && (p += `${s}${l}B`), p;
    },
    up: (u = 1) => `${s}${u}A`,
    down: (u = 1) => `${s}${u}B`,
    forward: (u = 1) => `${s}${u}C`,
    backward: (u = 1) => `${s}${u}D`,
    nextLine: (u = 1) => `${s}E`.repeat(u),
    prevLine: (u = 1) => `${s}F`.repeat(u),
    left: `${s}G`,
    hide: `${s}?25l`,
    show: `${s}?25h`,
    save: `${r}7`,
    restore: `${r}8`
  }, t = {
    up: (u = 1) => `${s}S`.repeat(u),
    down: (u = 1) => `${s}T`.repeat(u)
  }, D = {
    screen: `${s}2J`,
    up: (u = 1) => `${s}1J`.repeat(u),
    down: (u = 1) => `${s}J`.repeat(u),
    line: `${s}2K`,
    lineEnd: `${s}K`,
    lineStart: `${s}1K`,
    lines(u) {
      let l = "";
      for (let p = 0; p < u; p++)
        l += this.line + (p < u - 1 ? c.up() : "");
      return u && (l += c.left), l;
    }
  };
  return Y = { cursor: c, scroll: t, erase: D, beep: o }, Y;
}
var k = Qu(), R = { exports: {} }, mu;
function Xu() {
  if (mu) return R.exports;
  mu = 1;
  var r = String, s = function() {
    return { isColorSupported: !1, reset: r, bold: r, dim: r, italic: r, underline: r, inverse: r, hidden: r, strikethrough: r, black: r, red: r, green: r, yellow: r, blue: r, magenta: r, cyan: r, white: r, gray: r, bgBlack: r, bgRed: r, bgGreen: r, bgYellow: r, bgBlue: r, bgMagenta: r, bgCyan: r, bgWhite: r, blackBright: r, redBright: r, greenBright: r, yellowBright: r, blueBright: r, magentaBright: r, cyanBright: r, whiteBright: r, bgBlackBright: r, bgRedBright: r, bgGreenBright: r, bgYellowBright: r, bgBlueBright: r, bgMagentaBright: r, bgCyanBright: r, bgWhiteBright: r };
  };
  return R.exports = s(), R.exports.createColors = s, R.exports;
}
var ue = /* @__PURE__ */ Xu();
const d = /* @__PURE__ */ Ou(ue);
function ee({ onlyFirst: r = !1 } = {}) {
  const s = ["[\\u001B\\u009B][[\\]()#;?]*(?:(?:(?:(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]+)*|[a-zA-Z\\d]+(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]*)*)?(?:\\u0007|\\u001B\\u005C|\\u009C))", "(?:(?:\\d{1,4}(?:;\\d{0,4})*)?[\\dA-PR-TZcf-nq-uy=><~]))"].join("|");
  return new RegExp(s, r ? void 0 : "g");
}
const te = ee();
function wu(r) {
  if (typeof r != "string") throw new TypeError(`Expected a \`string\`, got \`${typeof r}\``);
  return r.replace(te, "");
}
function yu(r) {
  return r && r.__esModule && Object.prototype.hasOwnProperty.call(r, "default") ? r.default : r;
}
var xu = { exports: {} };
(function(r) {
  var s = {};
  r.exports = s, s.eastAsianWidth = function(c) {
    var t = c.charCodeAt(0), D = c.length == 2 ? c.charCodeAt(1) : 0, u = t;
    return 55296 <= t && t <= 56319 && 56320 <= D && D <= 57343 && (t &= 1023, D &= 1023, u = t << 10 | D, u += 65536), u == 12288 || 65281 <= u && u <= 65376 || 65504 <= u && u <= 65510 ? "F" : u == 8361 || 65377 <= u && u <= 65470 || 65474 <= u && u <= 65479 || 65482 <= u && u <= 65487 || 65490 <= u && u <= 65495 || 65498 <= u && u <= 65500 || 65512 <= u && u <= 65518 ? "H" : 4352 <= u && u <= 4447 || 4515 <= u && u <= 4519 || 4602 <= u && u <= 4607 || 9001 <= u && u <= 9002 || 11904 <= u && u <= 11929 || 11931 <= u && u <= 12019 || 12032 <= u && u <= 12245 || 12272 <= u && u <= 12283 || 12289 <= u && u <= 12350 || 12353 <= u && u <= 12438 || 12441 <= u && u <= 12543 || 12549 <= u && u <= 12589 || 12593 <= u && u <= 12686 || 12688 <= u && u <= 12730 || 12736 <= u && u <= 12771 || 12784 <= u && u <= 12830 || 12832 <= u && u <= 12871 || 12880 <= u && u <= 13054 || 13056 <= u && u <= 19903 || 19968 <= u && u <= 42124 || 42128 <= u && u <= 42182 || 43360 <= u && u <= 43388 || 44032 <= u && u <= 55203 || 55216 <= u && u <= 55238 || 55243 <= u && u <= 55291 || 63744 <= u && u <= 64255 || 65040 <= u && u <= 65049 || 65072 <= u && u <= 65106 || 65108 <= u && u <= 65126 || 65128 <= u && u <= 65131 || 110592 <= u && u <= 110593 || 127488 <= u && u <= 127490 || 127504 <= u && u <= 127546 || 127552 <= u && u <= 127560 || 127568 <= u && u <= 127569 || 131072 <= u && u <= 194367 || 177984 <= u && u <= 196605 || 196608 <= u && u <= 262141 ? "W" : 32 <= u && u <= 126 || 162 <= u && u <= 163 || 165 <= u && u <= 166 || u == 172 || u == 175 || 10214 <= u && u <= 10221 || 10629 <= u && u <= 10630 ? "Na" : u == 161 || u == 164 || 167 <= u && u <= 168 || u == 170 || 173 <= u && u <= 174 || 176 <= u && u <= 180 || 182 <= u && u <= 186 || 188 <= u && u <= 191 || u == 198 || u == 208 || 215 <= u && u <= 216 || 222 <= u && u <= 225 || u == 230 || 232 <= u && u <= 234 || 236 <= u && u <= 237 || u == 240 || 242 <= u && u <= 243 || 247 <= u && u <= 250 || u == 252 || u == 254 || u == 257 || u == 273 || u == 275 || u == 283 || 294 <= u && u <= 295 || u == 299 || 305 <= u && u <= 307 || u == 312 || 319 <= u && u <= 322 || u == 324 || 328 <= u && u <= 331 || u == 333 || 338 <= u && u <= 339 || 358 <= u && u <= 359 || u == 363 || u == 462 || u == 464 || u == 466 || u == 468 || u == 470 || u == 472 || u == 474 || u == 476 || u == 593 || u == 609 || u == 708 || u == 711 || 713 <= u && u <= 715 || u == 717 || u == 720 || 728 <= u && u <= 731 || u == 733 || u == 735 || 768 <= u && u <= 879 || 913 <= u && u <= 929 || 931 <= u && u <= 937 || 945 <= u && u <= 961 || 963 <= u && u <= 969 || u == 1025 || 1040 <= u && u <= 1103 || u == 1105 || u == 8208 || 8211 <= u && u <= 8214 || 8216 <= u && u <= 8217 || 8220 <= u && u <= 8221 || 8224 <= u && u <= 8226 || 8228 <= u && u <= 8231 || u == 8240 || 8242 <= u && u <= 8243 || u == 8245 || u == 8251 || u == 8254 || u == 8308 || u == 8319 || 8321 <= u && u <= 8324 || u == 8364 || u == 8451 || u == 8453 || u == 8457 || u == 8467 || u == 8470 || 8481 <= u && u <= 8482 || u == 8486 || u == 8491 || 8531 <= u && u <= 8532 || 8539 <= u && u <= 8542 || 8544 <= u && u <= 8555 || 8560 <= u && u <= 8569 || u == 8585 || 8592 <= u && u <= 8601 || 8632 <= u && u <= 8633 || u == 8658 || u == 8660 || u == 8679 || u == 8704 || 8706 <= u && u <= 8707 || 8711 <= u && u <= 8712 || u == 8715 || u == 8719 || u == 8721 || u == 8725 || u == 8730 || 8733 <= u && u <= 8736 || u == 8739 || u == 8741 || 8743 <= u && u <= 8748 || u == 8750 || 8756 <= u && u <= 8759 || 8764 <= u && u <= 8765 || u == 8776 || u == 8780 || u == 8786 || 8800 <= u && u <= 8801 || 8804 <= u && u <= 8807 || 8810 <= u && u <= 8811 || 8814 <= u && u <= 8815 || 8834 <= u && u <= 8835 || 8838 <= u && u <= 8839 || u == 8853 || u == 8857 || u == 8869 || u == 8895 || u == 8978 || 9312 <= u && u <= 9449 || 9451 <= u && u <= 9547 || 9552 <= u && u <= 9587 || 9600 <= u && u <= 9615 || 9618 <= u && u <= 9621 || 9632 <= u && u <= 9633 || 9635 <= u && u <= 9641 || 9650 <= u && u <= 9651 || 9654 <= u && u <= 9655 || 9660 <= u && u <= 9661 || 9664 <= u && u <= 9665 || 9670 <= u && u <= 9672 || u == 9675 || 9678 <= u && u <= 9681 || 9698 <= u && u <= 9701 || u == 9711 || 9733 <= u && u <= 9734 || u == 9737 || 9742 <= u && u <= 9743 || 9748 <= u && u <= 9749 || u == 9756 || u == 9758 || u == 9792 || u == 9794 || 9824 <= u && u <= 9825 || 9827 <= u && u <= 9829 || 9831 <= u && u <= 9834 || 9836 <= u && u <= 9837 || u == 9839 || 9886 <= u && u <= 9887 || 9918 <= u && u <= 9919 || 9924 <= u && u <= 9933 || 9935 <= u && u <= 9953 || u == 9955 || 9960 <= u && u <= 9983 || u == 10045 || u == 10071 || 10102 <= u && u <= 10111 || 11093 <= u && u <= 11097 || 12872 <= u && u <= 12879 || 57344 <= u && u <= 63743 || 65024 <= u && u <= 65039 || u == 65533 || 127232 <= u && u <= 127242 || 127248 <= u && u <= 127277 || 127280 <= u && u <= 127337 || 127344 <= u && u <= 127386 || 917760 <= u && u <= 917999 || 983040 <= u && u <= 1048573 || 1048576 <= u && u <= 1114109 ? "A" : "N";
  }, s.characterLength = function(c) {
    var t = this.eastAsianWidth(c);
    return t == "F" || t == "W" || t == "A" ? 2 : 1;
  };
  function o(c) {
    return c.match(/[\uD800-\uDBFF][\uDC00-\uDFFF]|[^\uD800-\uDFFF]/g) || [];
  }
  s.length = function(c) {
    for (var t = o(c), D = 0, u = 0; u < t.length; u++) D = D + this.characterLength(t[u]);
    return D;
  }, s.slice = function(c, t, D) {
    textLen = s.length(c), t = t || 0, D = D || 1, t < 0 && (t = textLen + t), D < 0 && (D = textLen + D);
    for (var u = "", l = 0, p = o(c), F = 0; F < p.length; F++) {
      var f = p[F], g = s.length(f);
      if (l >= t - (g == 2 ? 1 : 0)) if (l + g <= D) u += f;
      else break;
      l += g;
    }
    return u;
  };
})(xu);
var ie = xu.exports;
const De = yu(ie);
var se = function() {
  return /\uD83C\uDFF4\uDB40\uDC67\uDB40\uDC62(?:\uDB40\uDC77\uDB40\uDC6C\uDB40\uDC73|\uDB40\uDC73\uDB40\uDC63\uDB40\uDC74|\uDB40\uDC65\uDB40\uDC6E\uDB40\uDC67)\uDB40\uDC7F|(?:\uD83E\uDDD1\uD83C\uDFFF\u200D\u2764\uFE0F\u200D(?:\uD83D\uDC8B\u200D)?\uD83E\uDDD1|\uD83D\uDC69\uD83C\uDFFF\u200D\uD83E\uDD1D\u200D(?:\uD83D[\uDC68\uDC69]))(?:\uD83C[\uDFFB-\uDFFE])|(?:\uD83E\uDDD1\uD83C\uDFFE\u200D\u2764\uFE0F\u200D(?:\uD83D\uDC8B\u200D)?\uD83E\uDDD1|\uD83D\uDC69\uD83C\uDFFE\u200D\uD83E\uDD1D\u200D(?:\uD83D[\uDC68\uDC69]))(?:\uD83C[\uDFFB-\uDFFD\uDFFF])|(?:\uD83E\uDDD1\uD83C\uDFFD\u200D\u2764\uFE0F\u200D(?:\uD83D\uDC8B\u200D)?\uD83E\uDDD1|\uD83D\uDC69\uD83C\uDFFD\u200D\uD83E\uDD1D\u200D(?:\uD83D[\uDC68\uDC69]))(?:\uD83C[\uDFFB\uDFFC\uDFFE\uDFFF])|(?:\uD83E\uDDD1\uD83C\uDFFC\u200D\u2764\uFE0F\u200D(?:\uD83D\uDC8B\u200D)?\uD83E\uDDD1|\uD83D\uDC69\uD83C\uDFFC\u200D\uD83E\uDD1D\u200D(?:\uD83D[\uDC68\uDC69]))(?:\uD83C[\uDFFB\uDFFD-\uDFFF])|(?:\uD83E\uDDD1\uD83C\uDFFB\u200D\u2764\uFE0F\u200D(?:\uD83D\uDC8B\u200D)?\uD83E\uDDD1|\uD83D\uDC69\uD83C\uDFFB\u200D\uD83E\uDD1D\u200D(?:\uD83D[\uDC68\uDC69]))(?:\uD83C[\uDFFC-\uDFFF])|\uD83D\uDC68(?:\uD83C\uDFFB(?:\u200D(?:\u2764\uFE0F\u200D(?:\uD83D\uDC8B\u200D\uD83D\uDC68(?:\uD83C[\uDFFB-\uDFFF])|\uD83D\uDC68(?:\uD83C[\uDFFB-\uDFFF]))|\uD83E\uDD1D\u200D\uD83D\uDC68(?:\uD83C[\uDFFC-\uDFFF])|[\u2695\u2696\u2708]\uFE0F|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD]))?|(?:\uD83C[\uDFFC-\uDFFF])\u200D\u2764\uFE0F\u200D(?:\uD83D\uDC8B\u200D\uD83D\uDC68(?:\uD83C[\uDFFB-\uDFFF])|\uD83D\uDC68(?:\uD83C[\uDFFB-\uDFFF]))|\u200D(?:\u2764\uFE0F\u200D(?:\uD83D\uDC8B\u200D)?\uD83D\uDC68|(?:\uD83D[\uDC68\uDC69])\u200D(?:\uD83D\uDC66\u200D\uD83D\uDC66|\uD83D\uDC67\u200D(?:\uD83D[\uDC66\uDC67]))|\uD83D\uDC66\u200D\uD83D\uDC66|\uD83D\uDC67\u200D(?:\uD83D[\uDC66\uDC67])|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFF\u200D(?:\uD83E\uDD1D\u200D\uD83D\uDC68(?:\uD83C[\uDFFB-\uDFFE])|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFE\u200D(?:\uD83E\uDD1D\u200D\uD83D\uDC68(?:\uD83C[\uDFFB-\uDFFD\uDFFF])|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFD\u200D(?:\uD83E\uDD1D\u200D\uD83D\uDC68(?:\uD83C[\uDFFB\uDFFC\uDFFE\uDFFF])|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFC\u200D(?:\uD83E\uDD1D\u200D\uD83D\uDC68(?:\uD83C[\uDFFB\uDFFD-\uDFFF])|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|(?:\uD83C\uDFFF\u200D[\u2695\u2696\u2708]|\uD83C\uDFFE\u200D[\u2695\u2696\u2708]|\uD83C\uDFFD\u200D[\u2695\u2696\u2708]|\uD83C\uDFFC\u200D[\u2695\u2696\u2708]|\u200D[\u2695\u2696\u2708])\uFE0F|\u200D(?:(?:\uD83D[\uDC68\uDC69])\u200D(?:\uD83D[\uDC66\uDC67])|\uD83D[\uDC66\uDC67])|\uD83C\uDFFF|\uD83C\uDFFE|\uD83C\uDFFD|\uD83C\uDFFC)?|(?:\uD83D\uDC69(?:\uD83C\uDFFB\u200D\u2764\uFE0F\u200D(?:\uD83D\uDC8B\u200D(?:\uD83D[\uDC68\uDC69])|\uD83D[\uDC68\uDC69])|(?:\uD83C[\uDFFC-\uDFFF])\u200D\u2764\uFE0F\u200D(?:\uD83D\uDC8B\u200D(?:\uD83D[\uDC68\uDC69])|\uD83D[\uDC68\uDC69]))|\uD83E\uDDD1(?:\uD83C[\uDFFB-\uDFFF])\u200D\uD83E\uDD1D\u200D\uD83E\uDDD1)(?:\uD83C[\uDFFB-\uDFFF])|\uD83D\uDC69\u200D\uD83D\uDC69\u200D(?:\uD83D\uDC66\u200D\uD83D\uDC66|\uD83D\uDC67\u200D(?:\uD83D[\uDC66\uDC67]))|\uD83D\uDC69(?:\u200D(?:\u2764\uFE0F\u200D(?:\uD83D\uDC8B\u200D(?:\uD83D[\uDC68\uDC69])|\uD83D[\uDC68\uDC69])|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFF\u200D(?:\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFE\u200D(?:\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFD\u200D(?:\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFC\u200D(?:\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFB\u200D(?:\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD]))|\uD83E\uDDD1(?:\u200D(?:\uD83E\uDD1D\u200D\uD83E\uDDD1|\uD83C[\uDF3E\uDF73\uDF7C\uDF84\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFF\u200D(?:\uD83C[\uDF3E\uDF73\uDF7C\uDF84\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFE\u200D(?:\uD83C[\uDF3E\uDF73\uDF7C\uDF84\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFD\u200D(?:\uD83C[\uDF3E\uDF73\uDF7C\uDF84\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFC\u200D(?:\uD83C[\uDF3E\uDF73\uDF7C\uDF84\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFB\u200D(?:\uD83C[\uDF3E\uDF73\uDF7C\uDF84\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD]))|\uD83D\uDC69\u200D\uD83D\uDC66\u200D\uD83D\uDC66|\uD83D\uDC69\u200D\uD83D\uDC69\u200D(?:\uD83D[\uDC66\uDC67])|\uD83D\uDC69\u200D\uD83D\uDC67\u200D(?:\uD83D[\uDC66\uDC67])|(?:\uD83D\uDC41\uFE0F\u200D\uD83D\uDDE8|\uD83E\uDDD1(?:\uD83C\uDFFF\u200D[\u2695\u2696\u2708]|\uD83C\uDFFE\u200D[\u2695\u2696\u2708]|\uD83C\uDFFD\u200D[\u2695\u2696\u2708]|\uD83C\uDFFC\u200D[\u2695\u2696\u2708]|\uD83C\uDFFB\u200D[\u2695\u2696\u2708]|\u200D[\u2695\u2696\u2708])|\uD83D\uDC69(?:\uD83C\uDFFF\u200D[\u2695\u2696\u2708]|\uD83C\uDFFE\u200D[\u2695\u2696\u2708]|\uD83C\uDFFD\u200D[\u2695\u2696\u2708]|\uD83C\uDFFC\u200D[\u2695\u2696\u2708]|\uD83C\uDFFB\u200D[\u2695\u2696\u2708]|\u200D[\u2695\u2696\u2708])|\uD83D\uDE36\u200D\uD83C\uDF2B|\uD83C\uDFF3\uFE0F\u200D\u26A7|\uD83D\uDC3B\u200D\u2744|(?:(?:\uD83C[\uDFC3\uDFC4\uDFCA]|\uD83D[\uDC6E\uDC70\uDC71\uDC73\uDC77\uDC81\uDC82\uDC86\uDC87\uDE45-\uDE47\uDE4B\uDE4D\uDE4E\uDEA3\uDEB4-\uDEB6]|\uD83E[\uDD26\uDD35\uDD37-\uDD39\uDD3D\uDD3E\uDDB8\uDDB9\uDDCD-\uDDCF\uDDD4\uDDD6-\uDDDD])(?:\uD83C[\uDFFB-\uDFFF])|\uD83D\uDC6F|\uD83E[\uDD3C\uDDDE\uDDDF])\u200D[\u2640\u2642]|(?:\u26F9|\uD83C[\uDFCB\uDFCC]|\uD83D\uDD75)(?:\uFE0F|\uD83C[\uDFFB-\uDFFF])\u200D[\u2640\u2642]|\uD83C\uDFF4\u200D\u2620|(?:\uD83C[\uDFC3\uDFC4\uDFCA]|\uD83D[\uDC6E\uDC70\uDC71\uDC73\uDC77\uDC81\uDC82\uDC86\uDC87\uDE45-\uDE47\uDE4B\uDE4D\uDE4E\uDEA3\uDEB4-\uDEB6]|\uD83E[\uDD26\uDD35\uDD37-\uDD39\uDD3D\uDD3E\uDDB8\uDDB9\uDDCD-\uDDCF\uDDD4\uDDD6-\uDDDD])\u200D[\u2640\u2642]|[\xA9\xAE\u203C\u2049\u2122\u2139\u2194-\u2199\u21A9\u21AA\u2328\u23CF\u23ED-\u23EF\u23F1\u23F2\u23F8-\u23FA\u24C2\u25AA\u25AB\u25B6\u25C0\u25FB\u25FC\u2600-\u2604\u260E\u2611\u2618\u2620\u2622\u2623\u2626\u262A\u262E\u262F\u2638-\u263A\u2640\u2642\u265F\u2660\u2663\u2665\u2666\u2668\u267B\u267E\u2692\u2694-\u2697\u2699\u269B\u269C\u26A0\u26A7\u26B0\u26B1\u26C8\u26CF\u26D1\u26D3\u26E9\u26F0\u26F1\u26F4\u26F7\u26F8\u2702\u2708\u2709\u270F\u2712\u2714\u2716\u271D\u2721\u2733\u2734\u2744\u2747\u2763\u27A1\u2934\u2935\u2B05-\u2B07\u3030\u303D\u3297\u3299]|\uD83C[\uDD70\uDD71\uDD7E\uDD7F\uDE02\uDE37\uDF21\uDF24-\uDF2C\uDF36\uDF7D\uDF96\uDF97\uDF99-\uDF9B\uDF9E\uDF9F\uDFCD\uDFCE\uDFD4-\uDFDF\uDFF5\uDFF7]|\uD83D[\uDC3F\uDCFD\uDD49\uDD4A\uDD6F\uDD70\uDD73\uDD76-\uDD79\uDD87\uDD8A-\uDD8D\uDDA5\uDDA8\uDDB1\uDDB2\uDDBC\uDDC2-\uDDC4\uDDD1-\uDDD3\uDDDC-\uDDDE\uDDE1\uDDE3\uDDE8\uDDEF\uDDF3\uDDFA\uDECB\uDECD-\uDECF\uDEE0-\uDEE5\uDEE9\uDEF0\uDEF3])\uFE0F|\uD83C\uDFF3\uFE0F\u200D\uD83C\uDF08|\uD83D\uDC69\u200D\uD83D\uDC67|\uD83D\uDC69\u200D\uD83D\uDC66|\uD83D\uDE35\u200D\uD83D\uDCAB|\uD83D\uDE2E\u200D\uD83D\uDCA8|\uD83D\uDC15\u200D\uD83E\uDDBA|\uD83E\uDDD1(?:\uD83C\uDFFF|\uD83C\uDFFE|\uD83C\uDFFD|\uD83C\uDFFC|\uD83C\uDFFB)?|\uD83D\uDC69(?:\uD83C\uDFFF|\uD83C\uDFFE|\uD83C\uDFFD|\uD83C\uDFFC|\uD83C\uDFFB)?|\uD83C\uDDFD\uD83C\uDDF0|\uD83C\uDDF6\uD83C\uDDE6|\uD83C\uDDF4\uD83C\uDDF2|\uD83D\uDC08\u200D\u2B1B|\u2764\uFE0F\u200D(?:\uD83D\uDD25|\uD83E\uDE79)|\uD83D\uDC41\uFE0F|\uD83C\uDFF3\uFE0F|\uD83C\uDDFF(?:\uD83C[\uDDE6\uDDF2\uDDFC])|\uD83C\uDDFE(?:\uD83C[\uDDEA\uDDF9])|\uD83C\uDDFC(?:\uD83C[\uDDEB\uDDF8])|\uD83C\uDDFB(?:\uD83C[\uDDE6\uDDE8\uDDEA\uDDEC\uDDEE\uDDF3\uDDFA])|\uD83C\uDDFA(?:\uD83C[\uDDE6\uDDEC\uDDF2\uDDF3\uDDF8\uDDFE\uDDFF])|\uD83C\uDDF9(?:\uD83C[\uDDE6\uDDE8\uDDE9\uDDEB-\uDDED\uDDEF-\uDDF4\uDDF7\uDDF9\uDDFB\uDDFC\uDDFF])|\uD83C\uDDF8(?:\uD83C[\uDDE6-\uDDEA\uDDEC-\uDDF4\uDDF7-\uDDF9\uDDFB\uDDFD-\uDDFF])|\uD83C\uDDF7(?:\uD83C[\uDDEA\uDDF4\uDDF8\uDDFA\uDDFC])|\uD83C\uDDF5(?:\uD83C[\uDDE6\uDDEA-\uDDED\uDDF0-\uDDF3\uDDF7-\uDDF9\uDDFC\uDDFE])|\uD83C\uDDF3(?:\uD83C[\uDDE6\uDDE8\uDDEA-\uDDEC\uDDEE\uDDF1\uDDF4\uDDF5\uDDF7\uDDFA\uDDFF])|\uD83C\uDDF2(?:\uD83C[\uDDE6\uDDE8-\uDDED\uDDF0-\uDDFF])|\uD83C\uDDF1(?:\uD83C[\uDDE6-\uDDE8\uDDEE\uDDF0\uDDF7-\uDDFB\uDDFE])|\uD83C\uDDF0(?:\uD83C[\uDDEA\uDDEC-\uDDEE\uDDF2\uDDF3\uDDF5\uDDF7\uDDFC\uDDFE\uDDFF])|\uD83C\uDDEF(?:\uD83C[\uDDEA\uDDF2\uDDF4\uDDF5])|\uD83C\uDDEE(?:\uD83C[\uDDE8-\uDDEA\uDDF1-\uDDF4\uDDF6-\uDDF9])|\uD83C\uDDED(?:\uD83C[\uDDF0\uDDF2\uDDF3\uDDF7\uDDF9\uDDFA])|\uD83C\uDDEC(?:\uD83C[\uDDE6\uDDE7\uDDE9-\uDDEE\uDDF1-\uDDF3\uDDF5-\uDDFA\uDDFC\uDDFE])|\uD83C\uDDEB(?:\uD83C[\uDDEE-\uDDF0\uDDF2\uDDF4\uDDF7])|\uD83C\uDDEA(?:\uD83C[\uDDE6\uDDE8\uDDEA\uDDEC\uDDED\uDDF7-\uDDFA])|\uD83C\uDDE9(?:\uD83C[\uDDEA\uDDEC\uDDEF\uDDF0\uDDF2\uDDF4\uDDFF])|\uD83C\uDDE8(?:\uD83C[\uDDE6\uDDE8\uDDE9\uDDEB-\uDDEE\uDDF0-\uDDF5\uDDF7\uDDFA-\uDDFF])|\uD83C\uDDE7(?:\uD83C[\uDDE6\uDDE7\uDDE9-\uDDEF\uDDF1-\uDDF4\uDDF6-\uDDF9\uDDFB\uDDFC\uDDFE\uDDFF])|\uD83C\uDDE6(?:\uD83C[\uDDE8-\uDDEC\uDDEE\uDDF1\uDDF2\uDDF4\uDDF6-\uDDFA\uDDFC\uDDFD\uDDFF])|[#\*0-9]\uFE0F\u20E3|\u2764\uFE0F|(?:\uD83C[\uDFC3\uDFC4\uDFCA]|\uD83D[\uDC6E\uDC70\uDC71\uDC73\uDC77\uDC81\uDC82\uDC86\uDC87\uDE45-\uDE47\uDE4B\uDE4D\uDE4E\uDEA3\uDEB4-\uDEB6]|\uD83E[\uDD26\uDD35\uDD37-\uDD39\uDD3D\uDD3E\uDDB8\uDDB9\uDDCD-\uDDCF\uDDD4\uDDD6-\uDDDD])(?:\uD83C[\uDFFB-\uDFFF])|(?:\u26F9|\uD83C[\uDFCB\uDFCC]|\uD83D\uDD75)(?:\uFE0F|\uD83C[\uDFFB-\uDFFF])|\uD83C\uDFF4|(?:[\u270A\u270B]|\uD83C[\uDF85\uDFC2\uDFC7]|\uD83D[\uDC42\uDC43\uDC46-\uDC50\uDC66\uDC67\uDC6B-\uDC6D\uDC72\uDC74-\uDC76\uDC78\uDC7C\uDC83\uDC85\uDC8F\uDC91\uDCAA\uDD7A\uDD95\uDD96\uDE4C\uDE4F\uDEC0\uDECC]|\uD83E[\uDD0C\uDD0F\uDD18-\uDD1C\uDD1E\uDD1F\uDD30-\uDD34\uDD36\uDD77\uDDB5\uDDB6\uDDBB\uDDD2\uDDD3\uDDD5])(?:\uD83C[\uDFFB-\uDFFF])|(?:[\u261D\u270C\u270D]|\uD83D[\uDD74\uDD90])(?:\uFE0F|\uD83C[\uDFFB-\uDFFF])|[\u270A\u270B]|\uD83C[\uDF85\uDFC2\uDFC7]|\uD83D[\uDC08\uDC15\uDC3B\uDC42\uDC43\uDC46-\uDC50\uDC66\uDC67\uDC6B-\uDC6D\uDC72\uDC74-\uDC76\uDC78\uDC7C\uDC83\uDC85\uDC8F\uDC91\uDCAA\uDD7A\uDD95\uDD96\uDE2E\uDE35\uDE36\uDE4C\uDE4F\uDEC0\uDECC]|\uD83E[\uDD0C\uDD0F\uDD18-\uDD1C\uDD1E\uDD1F\uDD30-\uDD34\uDD36\uDD77\uDDB5\uDDB6\uDDBB\uDDD2\uDDD3\uDDD5]|\uD83C[\uDFC3\uDFC4\uDFCA]|\uD83D[\uDC6E\uDC70\uDC71\uDC73\uDC77\uDC81\uDC82\uDC86\uDC87\uDE45-\uDE47\uDE4B\uDE4D\uDE4E\uDEA3\uDEB4-\uDEB6]|\uD83E[\uDD26\uDD35\uDD37-\uDD39\uDD3D\uDD3E\uDDB8\uDDB9\uDDCD-\uDDCF\uDDD4\uDDD6-\uDDDD]|\uD83D\uDC6F|\uD83E[\uDD3C\uDDDE\uDDDF]|[\u231A\u231B\u23E9-\u23EC\u23F0\u23F3\u25FD\u25FE\u2614\u2615\u2648-\u2653\u267F\u2693\u26A1\u26AA\u26AB\u26BD\u26BE\u26C4\u26C5\u26CE\u26D4\u26EA\u26F2\u26F3\u26F5\u26FA\u26FD\u2705\u2728\u274C\u274E\u2753-\u2755\u2757\u2795-\u2797\u27B0\u27BF\u2B1B\u2B1C\u2B50\u2B55]|\uD83C[\uDC04\uDCCF\uDD8E\uDD91-\uDD9A\uDE01\uDE1A\uDE2F\uDE32-\uDE36\uDE38-\uDE3A\uDE50\uDE51\uDF00-\uDF20\uDF2D-\uDF35\uDF37-\uDF7C\uDF7E-\uDF84\uDF86-\uDF93\uDFA0-\uDFC1\uDFC5\uDFC6\uDFC8\uDFC9\uDFCF-\uDFD3\uDFE0-\uDFF0\uDFF8-\uDFFF]|\uD83D[\uDC00-\uDC07\uDC09-\uDC14\uDC16-\uDC3A\uDC3C-\uDC3E\uDC40\uDC44\uDC45\uDC51-\uDC65\uDC6A\uDC79-\uDC7B\uDC7D-\uDC80\uDC84\uDC88-\uDC8E\uDC90\uDC92-\uDCA9\uDCAB-\uDCFC\uDCFF-\uDD3D\uDD4B-\uDD4E\uDD50-\uDD67\uDDA4\uDDFB-\uDE2D\uDE2F-\uDE34\uDE37-\uDE44\uDE48-\uDE4A\uDE80-\uDEA2\uDEA4-\uDEB3\uDEB7-\uDEBF\uDEC1-\uDEC5\uDED0-\uDED2\uDED5-\uDED7\uDEEB\uDEEC\uDEF4-\uDEFC\uDFE0-\uDFEB]|\uD83E[\uDD0D\uDD0E\uDD10-\uDD17\uDD1D\uDD20-\uDD25\uDD27-\uDD2F\uDD3A\uDD3F-\uDD45\uDD47-\uDD76\uDD78\uDD7A-\uDDB4\uDDB7\uDDBA\uDDBC-\uDDCB\uDDD0\uDDE0-\uDDFF\uDE70-\uDE74\uDE78-\uDE7A\uDE80-\uDE86\uDE90-\uDEA8\uDEB0-\uDEB6\uDEC0-\uDEC2\uDED0-\uDED6]|(?:[\u231A\u231B\u23E9-\u23EC\u23F0\u23F3\u25FD\u25FE\u2614\u2615\u2648-\u2653\u267F\u2693\u26A1\u26AA\u26AB\u26BD\u26BE\u26C4\u26C5\u26CE\u26D4\u26EA\u26F2\u26F3\u26F5\u26FA\u26FD\u2705\u270A\u270B\u2728\u274C\u274E\u2753-\u2755\u2757\u2795-\u2797\u27B0\u27BF\u2B1B\u2B1C\u2B50\u2B55]|\uD83C[\uDC04\uDCCF\uDD8E\uDD91-\uDD9A\uDDE6-\uDDFF\uDE01\uDE1A\uDE2F\uDE32-\uDE36\uDE38-\uDE3A\uDE50\uDE51\uDF00-\uDF20\uDF2D-\uDF35\uDF37-\uDF7C\uDF7E-\uDF93\uDFA0-\uDFCA\uDFCF-\uDFD3\uDFE0-\uDFF0\uDFF4\uDFF8-\uDFFF]|\uD83D[\uDC00-\uDC3E\uDC40\uDC42-\uDCFC\uDCFF-\uDD3D\uDD4B-\uDD4E\uDD50-\uDD67\uDD7A\uDD95\uDD96\uDDA4\uDDFB-\uDE4F\uDE80-\uDEC5\uDECC\uDED0-\uDED2\uDED5-\uDED7\uDEEB\uDEEC\uDEF4-\uDEFC\uDFE0-\uDFEB]|\uD83E[\uDD0C-\uDD3A\uDD3C-\uDD45\uDD47-\uDD78\uDD7A-\uDDCB\uDDCD-\uDDFF\uDE70-\uDE74\uDE78-\uDE7A\uDE80-\uDE86\uDE90-\uDEA8\uDEB0-\uDEB6\uDEC0-\uDEC2\uDED0-\uDED6])|(?:[#\*0-9\xA9\xAE\u203C\u2049\u2122\u2139\u2194-\u2199\u21A9\u21AA\u231A\u231B\u2328\u23CF\u23E9-\u23F3\u23F8-\u23FA\u24C2\u25AA\u25AB\u25B6\u25C0\u25FB-\u25FE\u2600-\u2604\u260E\u2611\u2614\u2615\u2618\u261D\u2620\u2622\u2623\u2626\u262A\u262E\u262F\u2638-\u263A\u2640\u2642\u2648-\u2653\u265F\u2660\u2663\u2665\u2666\u2668\u267B\u267E\u267F\u2692-\u2697\u2699\u269B\u269C\u26A0\u26A1\u26A7\u26AA\u26AB\u26B0\u26B1\u26BD\u26BE\u26C4\u26C5\u26C8\u26CE\u26CF\u26D1\u26D3\u26D4\u26E9\u26EA\u26F0-\u26F5\u26F7-\u26FA\u26FD\u2702\u2705\u2708-\u270D\u270F\u2712\u2714\u2716\u271D\u2721\u2728\u2733\u2734\u2744\u2747\u274C\u274E\u2753-\u2755\u2757\u2763\u2764\u2795-\u2797\u27A1\u27B0\u27BF\u2934\u2935\u2B05-\u2B07\u2B1B\u2B1C\u2B50\u2B55\u3030\u303D\u3297\u3299]|\uD83C[\uDC04\uDCCF\uDD70\uDD71\uDD7E\uDD7F\uDD8E\uDD91-\uDD9A\uDDE6-\uDDFF\uDE01\uDE02\uDE1A\uDE2F\uDE32-\uDE3A\uDE50\uDE51\uDF00-\uDF21\uDF24-\uDF93\uDF96\uDF97\uDF99-\uDF9B\uDF9E-\uDFF0\uDFF3-\uDFF5\uDFF7-\uDFFF]|\uD83D[\uDC00-\uDCFD\uDCFF-\uDD3D\uDD49-\uDD4E\uDD50-\uDD67\uDD6F\uDD70\uDD73-\uDD7A\uDD87\uDD8A-\uDD8D\uDD90\uDD95\uDD96\uDDA4\uDDA5\uDDA8\uDDB1\uDDB2\uDDBC\uDDC2-\uDDC4\uDDD1-\uDDD3\uDDDC-\uDDDE\uDDE1\uDDE3\uDDE8\uDDEF\uDDF3\uDDFA-\uDE4F\uDE80-\uDEC5\uDECB-\uDED2\uDED5-\uDED7\uDEE0-\uDEE5\uDEE9\uDEEB\uDEEC\uDEF0\uDEF3-\uDEFC\uDFE0-\uDFEB]|\uD83E[\uDD0C-\uDD3A\uDD3C-\uDD45\uDD47-\uDD78\uDD7A-\uDDCB\uDDCD-\uDDFF\uDE70-\uDE74\uDE78-\uDE7A\uDE80-\uDE86\uDE90-\uDEA8\uDEB0-\uDEB6\uDEC0-\uDEC2\uDED0-\uDED6])\uFE0F|(?:[\u261D\u26F9\u270A-\u270D]|\uD83C[\uDF85\uDFC2-\uDFC4\uDFC7\uDFCA-\uDFCC]|\uD83D[\uDC42\uDC43\uDC46-\uDC50\uDC66-\uDC78\uDC7C\uDC81-\uDC83\uDC85-\uDC87\uDC8F\uDC91\uDCAA\uDD74\uDD75\uDD7A\uDD90\uDD95\uDD96\uDE45-\uDE47\uDE4B-\uDE4F\uDEA3\uDEB4-\uDEB6\uDEC0\uDECC]|\uD83E[\uDD0C\uDD0F\uDD18-\uDD1F\uDD26\uDD30-\uDD39\uDD3C-\uDD3E\uDD77\uDDB5\uDDB6\uDDB8\uDDB9\uDDBB\uDDCD-\uDDCF\uDDD1-\uDDDD])/g;
};
const re = yu(se);
function P(r, s = {}) {
  if (typeof r != "string" || r.length === 0 || (s = { ambiguousIsNarrow: !0, ...s }, r = wu(r), r.length === 0)) return 0;
  r = r.replace(re(), "  ");
  const o = s.ambiguousIsNarrow ? 1 : 2;
  let c = 0;
  for (const t of r) {
    const D = t.codePointAt(0);
    if (!(D <= 31 || D >= 127 && D <= 159 || D >= 768 && D <= 879))
      switch (De.eastAsianWidth(t)) {
        case "F":
        case "W":
          c += 2;
          break;
        case "A":
          c += o;
          break;
        default:
          c += 1;
      }
  }
  return c;
}
const Z = 10, du = (r = 0) => (s) => `\x1B[${s + r}m`, fu = (r = 0) => (s) => `\x1B[${38 + r};5;${s}m`, gu = (r = 0) => (s, o, c) => `\x1B[${38 + r};2;${s};${o};${c}m`, O = { modifier: { reset: [0, 0], bold: [1, 22], dim: [2, 22], italic: [3, 23], underline: [4, 24], overline: [53, 55], inverse: [7, 27], hidden: [8, 28], strikethrough: [9, 29] }, color: { black: [30, 39], red: [31, 39], green: [32, 39], yellow: [33, 39], blue: [34, 39], magenta: [35, 39], cyan: [36, 39], white: [37, 39], blackBright: [90, 39], gray: [90, 39], grey: [90, 39], redBright: [91, 39], greenBright: [92, 39], yellowBright: [93, 39], blueBright: [94, 39], magentaBright: [95, 39], cyanBright: [96, 39], whiteBright: [97, 39] }, bgColor: { bgBlack: [40, 49], bgRed: [41, 49], bgGreen: [42, 49], bgYellow: [43, 49], bgBlue: [44, 49], bgMagenta: [45, 49], bgCyan: [46, 49], bgWhite: [47, 49], bgBlackBright: [100, 49], bgGray: [100, 49], bgGrey: [100, 49], bgRedBright: [101, 49], bgGreenBright: [102, 49], bgYellowBright: [103, 49], bgBlueBright: [104, 49], bgMagentaBright: [105, 49], bgCyanBright: [106, 49], bgWhiteBright: [107, 49] } };
Object.keys(O.modifier);
const ne = Object.keys(O.color), oe = Object.keys(O.bgColor);
[...ne, ...oe];
function ae() {
  const r = /* @__PURE__ */ new Map();
  for (const [s, o] of Object.entries(O)) {
    for (const [c, t] of Object.entries(o)) O[c] = { open: `\x1B[${t[0]}m`, close: `\x1B[${t[1]}m` }, o[c] = O[c], r.set(t[0], t[1]);
    Object.defineProperty(O, s, { value: o, enumerable: !1 });
  }
  return Object.defineProperty(O, "codes", { value: r, enumerable: !1 }), O.color.close = "\x1B[39m", O.bgColor.close = "\x1B[49m", O.color.ansi = du(), O.color.ansi256 = fu(), O.color.ansi16m = gu(), O.bgColor.ansi = du(Z), O.bgColor.ansi256 = fu(Z), O.bgColor.ansi16m = gu(Z), Object.defineProperties(O, { rgbToAnsi256: { value: (s, o, c) => s === o && o === c ? s < 8 ? 16 : s > 248 ? 231 : Math.round((s - 8) / 247 * 24) + 232 : 16 + 36 * Math.round(s / 255 * 5) + 6 * Math.round(o / 255 * 5) + Math.round(c / 255 * 5), enumerable: !1 }, hexToRgb: { value: (s) => {
    const o = /[a-f\d]{6}|[a-f\d]{3}/i.exec(s.toString(16));
    if (!o) return [0, 0, 0];
    let [c] = o;
    c.length === 3 && (c = [...c].map((D) => D + D).join(""));
    const t = Number.parseInt(c, 16);
    return [t >> 16 & 255, t >> 8 & 255, t & 255];
  }, enumerable: !1 }, hexToAnsi256: { value: (s) => O.rgbToAnsi256(...O.hexToRgb(s)), enumerable: !1 }, ansi256ToAnsi: { value: (s) => {
    if (s < 8) return 30 + s;
    if (s < 16) return 90 + (s - 8);
    let o, c, t;
    if (s >= 232) o = ((s - 232) * 10 + 8) / 255, c = o, t = o;
    else {
      s -= 16;
      const l = s % 36;
      o = Math.floor(s / 36) / 5, c = Math.floor(l / 6) / 5, t = l % 6 / 5;
    }
    const D = Math.max(o, c, t) * 2;
    if (D === 0) return 30;
    let u = 30 + (Math.round(t) << 2 | Math.round(c) << 1 | Math.round(o));
    return D === 2 && (u += 60), u;
  }, enumerable: !1 }, rgbToAnsi: { value: (s, o, c) => O.ansi256ToAnsi(O.rgbToAnsi256(s, o, c)), enumerable: !1 }, hexToAnsi: { value: (s) => O.ansi256ToAnsi(O.hexToAnsi256(s)), enumerable: !1 } }), O;
}
const le = ae(), z = /* @__PURE__ */ new Set(["\x1B", ""]), he = 39, Du = "\x07", Su = "[", ce = "]", Tu = "m", su = `${ce}8;;`, Eu = (r) => `${z.values().next().value}${Su}${r}${Tu}`, Au = (r) => `${z.values().next().value}${su}${r}${Du}`, Ce = (r) => r.split(" ").map((s) => P(s)), Q = (r, s, o) => {
  const c = [...s];
  let t = !1, D = !1, u = P(wu(r[r.length - 1]));
  for (const [l, p] of c.entries()) {
    const F = P(p);
    if (u + F <= o ? r[r.length - 1] += p : (r.push(p), u = 0), z.has(p) && (t = !0, D = c.slice(l + 1).join("").startsWith(su)), t) {
      D ? p === Du && (t = !1, D = !1) : p === Tu && (t = !1);
      continue;
    }
    u += F, u === o && l < c.length - 1 && (r.push(""), u = 0);
  }
  !u && r[r.length - 1].length > 0 && r.length > 1 && (r[r.length - 2] += r.pop());
}, pe = (r) => {
  const s = r.split(" ");
  let o = s.length;
  for (; o > 0 && !(P(s[o - 1]) > 0); ) o--;
  return o === s.length ? r : s.slice(0, o).join(" ") + s.slice(o).join("");
}, Fe = (r, s, o = {}) => {
  if (o.trim !== !1 && r.trim() === "") return "";
  let c = "", t, D;
  const u = Ce(r);
  let l = [""];
  for (const [F, f] of r.split(" ").entries()) {
    o.trim !== !1 && (l[l.length - 1] = l[l.length - 1].trimStart());
    let g = P(l[l.length - 1]);
    if (F !== 0 && (g >= s && (o.wordWrap === !1 || o.trim === !1) && (l.push(""), g = 0), (g > 0 || o.trim === !1) && (l[l.length - 1] += " ", g++)), o.hard && u[F] > s) {
      const B = s - g, v = 1 + Math.floor((u[F] - B - 1) / s);
      Math.floor((u[F] - 1) / s) < v && l.push(""), Q(l, f, s);
      continue;
    }
    if (g + u[F] > s && g > 0 && u[F] > 0) {
      if (o.wordWrap === !1 && g < s) {
        Q(l, f, s);
        continue;
      }
      l.push("");
    }
    if (g + u[F] > s && o.wordWrap === !1) {
      Q(l, f, s);
      continue;
    }
    l[l.length - 1] += f;
  }
  o.trim !== !1 && (l = l.map((F) => pe(F)));
  const p = [...l.join(`
`)];
  for (const [F, f] of p.entries()) {
    if (c += f, z.has(f)) {
      const { groups: B } = new RegExp(`(?:\\${Su}(?<code>\\d+)m|\\${su}(?<uri>.*)${Du})`).exec(p.slice(F).join("")) || { groups: {} };
      if (B.code !== void 0) {
        const v = Number.parseFloat(B.code);
        t = v === he ? void 0 : v;
      } else B.uri !== void 0 && (D = B.uri.length === 0 ? void 0 : B.uri);
    }
    const g = le.codes.get(Number(t));
    p[F + 1] === `
` ? (D && (c += Au("")), t && g && (c += Eu(g))) : f === `
` && (t && g && (c += Eu(t)), D && (c += Au(D)));
  }
  return c;
};
function _u(r, s, o) {
  return String(r).normalize().replace(/\r\n/g, `
`).split(`
`).map((c) => Fe(c, s, o)).join(`
`);
}
const me = ["up", "down", "left", "right", "space", "enter", "cancel"], G = { actions: new Set(me), aliases: /* @__PURE__ */ new Map([["k", "up"], ["j", "down"], ["h", "left"], ["l", "right"], ["", "cancel"], ["escape", "cancel"]]) };
function Vu(r, s) {
  if (typeof r == "string") return G.aliases.get(r) === s;
  for (const o of r) if (o !== void 0 && Vu(o, s)) return !0;
  return !1;
}
function de(r, s) {
  if (r === s) return;
  const o = r.split(`
`), c = s.split(`
`), t = [];
  for (let D = 0; D < Math.max(o.length, c.length); D++) o[D] !== c[D] && t.push(D);
  return t;
}
globalThis.process.platform.startsWith("win");
const eu = Symbol("clack:cancel");
function X(r) {
  return r === eu;
}
function L(r, s) {
  const o = r;
  o.isTTY && o.setRawMode(s);
}
var fe = Object.defineProperty, ge = (r, s, o) => s in r ? fe(r, s, { enumerable: !0, configurable: !0, writable: !0, value: o }) : r[s] = o, x = (r, s, o) => (ge(r, typeof s != "symbol" ? s + "" : s, o), o);
class ku {
  constructor(s, o = !0) {
    x(this, "input"), x(this, "output"), x(this, "_abortSignal"), x(this, "rl"), x(this, "opts"), x(this, "_render"), x(this, "_track", !1), x(this, "_prevFrame", ""), x(this, "_subscribers", /* @__PURE__ */ new Map()), x(this, "_cursor", 0), x(this, "state", "initial"), x(this, "error", ""), x(this, "value");
    const { input: c = Ru, output: t = Lu, render: D, signal: u, ...l } = s;
    this.opts = l, this.onKeypress = this.onKeypress.bind(this), this.close = this.close.bind(this), this.render = this.render.bind(this), this._render = D.bind(this), this._track = o, this._abortSignal = u, this.input = c, this.output = t;
  }
  unsubscribe() {
    this._subscribers.clear();
  }
  setSubscriber(s, o) {
    const c = this._subscribers.get(s) ?? [];
    c.push(o), this._subscribers.set(s, c);
  }
  on(s, o) {
    this.setSubscriber(s, { cb: o });
  }
  once(s, o) {
    this.setSubscriber(s, { cb: o, once: !0 });
  }
  emit(s, ...o) {
    const c = this._subscribers.get(s) ?? [], t = [];
    for (const D of c) D.cb(...o), D.once && t.push(() => c.splice(c.indexOf(D), 1));
    for (const D of t) D();
  }
  prompt() {
    return new Promise((s, o) => {
      if (this._abortSignal) {
        if (this._abortSignal.aborted) return this.state = "cancel", this.close(), s(eu);
        this._abortSignal.addEventListener("abort", () => {
          this.state = "cancel", this.close();
        }, { once: !0 });
      }
      const c = new Gu(0);
      c._write = (t, D, u) => {
        this._track && (this.value = this.rl?.line.replace(/\t/g, ""), this._cursor = this.rl?.cursor ?? 0, this.emit("value", this.value)), u();
      }, this.input.pipe(c), this.rl = nu.createInterface({ input: this.input, output: c, tabSize: 2, prompt: "", escapeCodeTimeout: 50 }), nu.emitKeypressEvents(this.input, this.rl), this.rl.prompt(), this.opts.initialValue !== void 0 && this._track && this.rl.write(this.opts.initialValue), this.input.on("keypress", this.onKeypress), L(this.input, !0), this.output.on("resize", this.render), this.render(), this.once("submit", () => {
        this.output.write(k.cursor.show), this.output.off("resize", this.render), L(this.input, !1), s(this.value);
      }), this.once("cancel", () => {
        this.output.write(k.cursor.show), this.output.off("resize", this.render), L(this.input, !1), s(eu);
      });
    });
  }
  onKeypress(s, o) {
    if (this.state === "error" && (this.state = "active"), o?.name && (!this._track && G.aliases.has(o.name) && this.emit("cursor", G.aliases.get(o.name)), G.actions.has(o.name) && this.emit("cursor", o.name)), s && (s.toLowerCase() === "y" || s.toLowerCase() === "n") && this.emit("confirm", s.toLowerCase() === "y"), s === "	" && this.opts.placeholder && (this.value || (this.rl?.write(this.opts.placeholder), this.emit("value", this.opts.placeholder))), s && this.emit("key", s.toLowerCase()), o?.name === "return") {
      if (this.opts.validate) {
        const c = this.opts.validate(this.value);
        c && (this.error = c instanceof Error ? c.message : c, this.state = "error", this.rl?.write(this.value));
      }
      this.state !== "error" && (this.state = "submit");
    }
    Vu([s, o?.name, o?.sequence], "cancel") && (this.state = "cancel"), (this.state === "submit" || this.state === "cancel") && this.emit("finalize"), this.render(), (this.state === "submit" || this.state === "cancel") && this.close();
  }
  close() {
    this.input.unpipe(), this.input.removeListener("keypress", this.onKeypress), this.output.write(`
`), L(this.input, !1), this.rl?.close(), this.rl = void 0, this.emit(`${this.state}`, this.value), this.unsubscribe();
  }
  restoreCursor() {
    const s = _u(this._prevFrame, process.stdout.columns, { hard: !0 }).split(`
`).length - 1;
    this.output.write(k.cursor.move(-999, s * -1));
  }
  render() {
    const s = _u(this._render(this) ?? "", process.stdout.columns, { hard: !0 });
    if (s !== this._prevFrame) {
      if (this.state === "initial") this.output.write(k.cursor.hide);
      else {
        const o = de(this._prevFrame, s);
        if (this.restoreCursor(), o && o?.length === 1) {
          const c = o[0];
          this.output.write(k.cursor.move(0, c)), this.output.write(k.erase.lines(1));
          const t = s.split(`
`);
          this.output.write(t[c]), this._prevFrame = s, this.output.write(k.cursor.move(0, t.length - c - 1));
          return;
        }
        if (o && o?.length > 1) {
          const c = o[0];
          this.output.write(k.cursor.move(0, c)), this.output.write(k.erase.down());
          const t = s.split(`
`).slice(c);
          this.output.write(t.join(`
`)), this._prevFrame = s;
          return;
        }
        this.output.write(k.erase.down());
      }
      this.output.write(s), this.state === "initial" && (this.state = "active"), this._prevFrame = s;
    }
  }
}
var Ee = Object.defineProperty, Ae = (r, s, o) => s in r ? Ee(r, s, { enumerable: !0, configurable: !0, writable: !0, value: o }) : r[s] = o, Bu = (r, s, o) => (Ae(r, typeof s != "symbol" ? s + "" : s, o), o);
class _e extends ku {
  constructor(s) {
    super(s, !1), Bu(this, "options"), Bu(this, "cursor", 0), this.options = s.options, this.cursor = this.options.findIndex(({ value: o }) => o === s.initialValue), this.cursor === -1 && (this.cursor = 0), this.changeValue(), this.on("cursor", (o) => {
      switch (o) {
        case "left":
        case "up":
          this.cursor = this.cursor === 0 ? this.options.length - 1 : this.cursor - 1;
          break;
        case "down":
        case "right":
          this.cursor = this.cursor === this.options.length - 1 ? 0 : this.cursor + 1;
          break;
      }
      this.changeValue();
    });
  }
  get _value() {
    return this.options[this.cursor];
  }
  changeValue() {
    this.value = this._value.value;
  }
}
class Be extends ku {
  get valueWithCursor() {
    if (this.state === "submit") return this.value;
    if (this.cursor >= this.value.length) return `${this.value}█`;
    const s = this.value.slice(0, this.cursor), [o, ...c] = this.value.slice(this.cursor);
    return `${s}${d.inverse(o)}${c.join("")}`;
  }
  get cursor() {
    return this._cursor;
  }
  constructor(s) {
    super(s), this.on("finalize", () => {
      this.value || (this.value = s.defaultValue);
    });
  }
}
function be() {
  return V.platform !== "win32" ? V.env.TERM !== "linux" : !!V.env.CI || !!V.env.WT_SESSION || !!V.env.TERMINUS_SUBLIME || V.env.ConEmuTask === "{cmd::Cmder}" || V.env.TERM_PROGRAM === "Terminus-Sublime" || V.env.TERM_PROGRAM === "vscode" || V.env.TERM === "xterm-256color" || V.env.TERM === "alacritty" || V.env.TERMINAL_EMULATOR === "JetBrains-JediTerm";
}
const Oe = be(), S = (r, s) => Oe ? r : s, ve = S("◆", "*"), $e = S("■", "x"), we = S("▲", "x"), Hu = S("◇", "o"), ye = S("┌", "T"), w = S("│", "|"), U = S("└", "—"), xe = S("●", ">"), Se = S("○", " "), Te = S("●", "•"), Ve = S("◆", "*"), ke = S("▲", "!"), He = S("■", "x"), Pu = (r) => {
  switch (r) {
    case "initial":
    case "active":
      return d.cyan(ve);
    case "cancel":
      return d.red($e);
    case "error":
      return d.yellow(we);
    case "submit":
      return d.green(Hu);
  }
}, Pe = (r) => {
  const { cursor: s, options: o, style: c } = r, t = r.maxItems ?? Number.POSITIVE_INFINITY, D = Math.max(process.stdout.rows - 4, 0), u = Math.min(D, Math.max(t, 5));
  let l = 0;
  s >= l + u - 3 ? l = Math.max(Math.min(s - u + 3, o.length - u), 0) : s < l + 2 && (l = Math.max(s - 2, 0));
  const p = u < o.length && l > 0, F = u < o.length && l + u < o.length;
  return o.slice(l, l + u).map((f, g, B) => {
    const v = g === 0 && p, b = g === B.length - 1 && F;
    return v || b ? d.dim("...") : c(f, g + l === s);
  });
}, bu = (r) => new Be({ validate: r.validate, placeholder: r.placeholder, defaultValue: r.defaultValue, initialValue: r.initialValue, render() {
  const s = `${d.gray(w)}
${Pu(this.state)}  ${r.message}
`, o = r.placeholder ? d.inverse(r.placeholder[0]) + d.dim(r.placeholder.slice(1)) : d.inverse(d.hidden("_")), c = this.value ? this.valueWithCursor : o;
  switch (this.state) {
    case "error":
      return `${s.trim()}
${d.yellow(w)}  ${c}
${d.yellow(U)}  ${d.yellow(this.error)}
`;
    case "submit":
      return `${s}${d.gray(w)}  ${d.dim(this.value || r.placeholder)}`;
    case "cancel":
      return `${s}${d.gray(w)}  ${d.strikethrough(d.dim(this.value ?? ""))}${this.value?.trim() ? `
${d.gray(w)}` : ""}`;
    default:
      return `${s}${d.cyan(w)}  ${c}
${d.cyan(U)}
`;
  }
} }).prompt(), We = (r) => {
  const s = (o, c) => {
    const t = o.label ?? String(o.value);
    switch (c) {
      case "selected":
        return `${d.dim(t)}`;
      case "active":
        return `${d.green(xe)} ${t} ${o.hint ? d.dim(`(${o.hint})`) : ""}`;
      case "cancelled":
        return `${d.strikethrough(d.dim(t))}`;
      default:
        return `${d.dim(Se)} ${d.dim(t)}`;
    }
  };
  return new _e({ options: r.options, initialValue: r.initialValue, render() {
    const o = `${d.gray(w)}
${Pu(this.state)}  ${r.message}
`;
    switch (this.state) {
      case "submit":
        return `${o}${d.gray(w)}  ${s(this.options[this.cursor], "selected")}`;
      case "cancel":
        return `${o}${d.gray(w)}  ${s(this.options[this.cursor], "cancelled")}
${d.gray(w)}`;
      default:
        return `${o}${d.cyan(w)}  ${Pe({ cursor: this.cursor, options: this.options, maxItems: r.maxItems, style: (c, t) => s(c, t ? "active" : "inactive") }).join(`
${d.cyan(w)}  `)}
${d.cyan(U)}
`;
    }
  } }).prompt();
}, uu = (r = "") => {
  process.stdout.write(`${d.gray(U)}  ${d.red(r)}

`);
}, Me = (r = "") => {
  process.stdout.write(`${d.gray(ye)}  ${r}
`);
}, H = { message: (r = "", { symbol: s = d.gray(w) } = {}) => {
  const o = [`${d.gray(w)}`];
  if (r) {
    const [c, ...t] = r.split(`
`);
    o.push(`${s}  ${c}`, ...t.map((D) => `${d.gray(w)}  ${D}`));
  }
  process.stdout.write(`${o.join(`
`)}
`);
}, info: (r) => {
  H.message(r, { symbol: d.blue(Te) });
}, success: (r) => {
  H.message(r, { symbol: d.green(Ve) });
}, step: (r) => {
  H.message(r, { symbol: d.green(Hu) });
}, warn: (r) => {
  H.message(r, { symbol: d.yellow(ke) });
}, warning: (r) => {
  H.warn(r);
}, error: (r) => {
  H.message(r, { symbol: d.red(He) });
} };
`${d.gray(w)}`;
const Ie = async (r) => {
  Me(d.inverse("nsm cli : installer"));
  let s = process.cwd();
  if (r.location)
    H.message(`Using supplied directory: ${r.location}`, { symbol: d.cyan("~") }), s = r.location;
  else {
    const t = await bu({
      message: "Install Directory",
      placeholder: "Leave empty to choose current directory",
      defaultValue: process.cwd()
    });
    X(t) && (uu("adios!"), process.exit(0)), t && (s = t);
  }
  let o = "manual";
  if (r.install)
    o = r.install;
  else {
    const t = await We({
      message: "Install System Service?",
      options: [
        { value: "manual", label: "Manual Install" },
        { value: "windows", label: "Windows Service Install" },
        { value: "linux", label: "Systemd Service Install" },
        { value: "linux-print", label: "Systemd Service - Print Configuration" }
      ]
    });
    X(t) && (uu("adios!"), process.exit(0)), t && (o = t);
  }
  let c = process.execPath;
  if (o !== "manual") {
    const t = await bu({
      message: "Path to node executable:",
      defaultValue: process.execPath,
      placeholder: "Enter to use current executable"
    });
    X(t) && (uu("adios!"), process.exit(0)), t && (c = t);
  }
  console.log({ location: s, install: o, node: c });
}, je = new Zu("install").description("Downloads and installs NSM").option("-q", "--quiet", "No console output. Errors if arguments are missing.").action((r, s) => {
  s.quiet || Ie(s).then((o) => {
  }).catch((o) => {
    console.error(o);
  });
});
iu.name("@hi-ashleyj/nsm-cli").version("1.0.0");
iu.addCommand(je);
iu.parse();
//# sourceMappingURL=bin.js.map
