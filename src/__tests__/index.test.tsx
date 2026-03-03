// Copyright 2024 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.
import "@testing-library/jest-dom";
import { expect, test, vi } from "vitest";
import { render, getQueriesForElement } from "@lynx-js/react/testing-library";

import { App } from "../App.jsx";

test("App", async () => {
  const cb = vi.fn();

  render(
    <App
      onRender={() => {
        cb(`__MAIN_THREAD__: ${__MAIN_THREAD__}`);
      }}
    />,
  );
  expect(cb).toBeCalledTimes(1);
  expect(cb.mock.calls).toMatchInlineSnapshot(`
    [
      [
        "__MAIN_THREAD__: false",
      ],
    ]
  `);
  const { findByText } = getQueriesForElement(elementTree.root!);
  const title = await findByText("Carteira Lynx");
  const section = await findByText("Atividade recente");
  const actionButton = await findByText("Adicionar nova transacao");
  expect(title).toBeInTheDocument();
  expect(section).toBeInTheDocument();
  expect(actionButton).toBeInTheDocument();
  expect(actionButton).toMatchInlineSnapshot(`
    <text
      class="text-center text-sm font-medium text-white"
    >
      Adicionar nova transacao
    </text>
  `);
});
