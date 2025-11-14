import { LogLevel } from '../enums/log-level.enum';
import { Log } from '../models/log.model';
import { logger } from '../utils/logger.util';
import { NodePath } from '@babel/traverse';

import { TransformationDetails } from '../models/transformation-details.model';
import * as T from '@babel/types';

function traverseAndReplace(parentNode: any, key: string, varName: string): void {

  if (parentNode[key] && parentNode[key].type === 'Identifier' && parentNode[key].name === varName) {
    parentNode[key].name = `${varName}Current`;
    return;
  }

  if (parentNode[key] != null && typeof parentNode[key] === 'object') {
    Object.keys(parentNode[key])
      .forEach((newKey: string): void => traverseAndReplace(parentNode[key], newKey, varName));
  }

}

export default function selfReferentialSetState(td: TransformationDetails): void {


  const theNode: NodePath<T.Node> = td.astNodeAfter;

  if (!theNode.isCallExpression()) {
    logger.log(
      new Log.Builder()
        .withSeverity(LogLevel.LOG)
        .withModule('transformations.selfReferentialSetState()')
        .withMessage('Expected call expression, got a ' + theNode.type)
        .build()
    );
    return;
  }

  Object.keys(theNode.node)
    .forEach((key: string): void => traverseAndReplace(theNode.node, key, td.additionalInfo.varName));

  if (!T.isArrowFunctionExpression(theNode.node.arguments[0])) {
    const body: T.Expression = <T.Expression>theNode.node.arguments[0];
    const funcExpr: T.ArrowFunctionExpression =
      T.arrowFunctionExpression([T.identifier(`${td.additionalInfo.varName}Current`)], body);

    theNode.node.arguments.pop();
    theNode.node.arguments.push(funcExpr);

  }

}
