<script lang="ts">
  import type { Compensation } from '@/core/storage/storage';

  interface Props {
    compensation?: Compensation | null;
    currency?: string;
    desiredSalary?: number | string;
    minimumSalary?: number | string;
    currentSalary?: number | string;
    salaryPeriod?: Compensation['salaryPeriod'];
    onDirty?: () => void;
  }

  let {
    compensation,
    currency = $bindable(''),
    desiredSalary = $bindable(''),
    minimumSalary = $bindable(''),
    currentSalary = $bindable(''),
    salaryPeriod = $bindable(undefined),
    onDirty,
  }: Props = $props();
</script>

<fieldset class="profile-fieldset" aria-labelledby="compensation-legend">
  <legend id="compensation-legend" class="legend">Compensation</legend>
  <div class="form-grid">
    <div class="form-group">
      <label for="currency">Currency</label>
      <input
        id="currency"
        name="currency"
        type="text"
        value={compensation?.currency ?? currency}
        oninput={(e) => {
          const val = (e.currentTarget as HTMLInputElement).value;
          if (compensation) compensation.currency = val;
          currency = val;
          onDirty?.();
        }}
        placeholder="USD"
        class="input-field"
      />
    </div>

    <div class="form-group">
      <label for="salaryPeriod">Salary Period</label>
      <select
        id="salaryPeriod"
        name="salaryPeriod"
        value={compensation?.salaryPeriod ?? salaryPeriod ?? ''}
        onchange={(e) => {
          const raw = (e.currentTarget as HTMLSelectElement).value;
          const val =
            raw === 'annual' || raw === 'monthly' || raw === 'hourly' ? raw : undefined;
          if (compensation) compensation.salaryPeriod = val;
          salaryPeriod = val;
          onDirty?.();
        }}
        class="input-field"
      >
        <option value="">Select period</option>
        <option value="annual">Annual</option>
        <option value="monthly">Monthly</option>
        <option value="hourly">Hourly</option>
      </select>
    </div>

    <div class="form-group">
      <label for="desiredSalary">Desired Salary</label>
      <input
        id="desiredSalary"
        name="desiredSalary"
        type="number"
        value={compensation?.desiredSalary !== undefined
          ? String(compensation.desiredSalary)
          : desiredSalary}
        oninput={(e) => {
          const val = (e.currentTarget as HTMLInputElement).value;
          if (compensation) compensation.desiredSalary = val ? Number(val) : undefined;
          desiredSalary = val;
          onDirty?.();
        }}
        class="input-field"
      />
    </div>

    <div class="form-group">
      <label for="minimumSalary">Minimum Salary</label>
      <input
        id="minimumSalary"
        name="minimumSalary"
        type="number"
        value={compensation?.minimumSalary !== undefined
          ? String(compensation.minimumSalary)
          : minimumSalary}
        oninput={(e) => {
          const val = (e.currentTarget as HTMLInputElement).value;
          if (compensation) compensation.minimumSalary = val ? Number(val) : undefined;
          minimumSalary = val;
          onDirty?.();
        }}
        class="input-field"
      />
    </div>

    <div class="form-group">
      <label for="currentSalary">Current Salary</label>
      <input
        id="currentSalary"
        name="currentSalary"
        type="number"
        value={compensation?.currentSalary !== undefined
          ? String(compensation.currentSalary)
          : currentSalary}
        oninput={(e) => {
          const val = (e.currentTarget as HTMLInputElement).value;
          if (compensation) compensation.currentSalary = val ? Number(val) : undefined;
          currentSalary = val;
          onDirty?.();
        }}
        class="input-field"
      />
    </div>
  </div>
</fieldset>

<style>
  @import '/src/styles/tokens.css';
</style>
