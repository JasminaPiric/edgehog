#
# This file is part of Edgehog.
#
# Copyright 2026 SECO Mind Srl
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#    http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#
# SPDX-License-Identifier: Apache-2.0
#

defmodule Edgehog.Containers.Volume.Deployment.Calculations.Dangling do
  @moduledoc """
  Calculates whether a volume deployment is dangling.

  A volume deployment is dangling if it is not associated with any container deployments
  and its volume does not have a "Retain" reclaim policy.
  """

  use Ash.Resource.Calculation

  alias Ash.Resource.Calculation

  @impl Calculation
  def init(opts), do: {:ok, opts}

  @impl Calculation
  def load(_query, _opts, _context) do
    [:container_deployments, volume: [:reclaim_policy]]
  end

  @impl Calculation
  def calculate(records, _opts, _context) do
    Enum.map(records, &dangling?/1)
  end

  def dangling?(%{container_deployments: [_ | _]}), do: false

  def dangling?(%{volume: %{reclaim_policy: policy}})
      when policy in ["Retain", :Retain, :retain, "retain"],
      do: false

  def dangling?(_resource), do: true
end
