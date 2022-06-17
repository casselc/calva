import * as printer from '../printer';
import * as replSession from '../nrepl/repl-session';
import * as outputWindow from '../results-output/results-doc';
import * as evaluate from '../evaluate';
import { cljsLib } from '../utilities';

type Result = {
  result: string;
  ns: string;
  output: string;
  errorOutput: string;
};

type ReplSessionType = 'clj' | 'cljs' | 'cljc' | undefined;


export async function evaluateCodeInSession(code:string, sessionKey : ReplSessionType = currentSessionKey(), options : any = {}) {
  return await evaluate.evaluateInOutputWindow(code, sessionKey, currentSessionNs(), options);
}
 
export const evaluateCode = async (
  sessionKey: 'clj' | 'cljs' | 'cljc' | undefined,
  code: string,
  output?: {
    stdout: (m: string) => void;
    stderr: (m: string) => void;
  }
): Promise<Result> => {
  const session = replSession.getSession(sessionKey || undefined);
  if (!session) {
    throw new Error(`Can't retrieve REPL session for session key: ${sessionKey}.`);
  }
  const stdout = output
    ? output.stdout
    : (_m: string) => {
        // Do nothing
      };
  const stderr = output
    ? output.stdout
    : (_m: string) => {
        // Do nothing
      };
  const evaluation = session.eval(code, undefined, {
    stdout: stdout,
    stderr: stderr,
    pprintOptions: printer.disabledPrettyPrinter,
  });
  return {
    result: await evaluation.value,
    ns: evaluation.ns,
    output: evaluation.outPut,
    errorOutput: evaluation.errorOutput,
  };
};

export const currentSessionKey = () : ReplSessionType => {
  return <ReplSessionType> replSession.getReplSessionType(cljsLib.getStateValue('connected'));
};

export const currentSessionNs = () => {
  return outputWindow.getNs();
}