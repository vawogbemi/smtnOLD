import { ActionFunctionArgs, redirect } from "@remix-run/node";
import { sendSms, supabaseServiceRoleClient } from "~/api/server";

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const formData = await request.formData();

  const supabase = supabaseServiceRoleClient();

  if (
    ["sender", "receiver", "customer_3", "customer_4", "customer_5"].includes(
      params.role!
    ) === false
  ) {
    return redirect("/404");
  }

  const { data: customers, error: customerError } = await supabase
    .from("customers")
    .insert({
      phone: "+" + params.phone!,
      name: formData.get("name") as string,
      email: formData.get("email") as string,
    })
    .select();

  if (customerError) {
    console.error(customerError);
  }
  const customer = customers?.at(0);

  if (customer) {
    switch (params.role!) {
      case "sender":
        await supabase
          .from("references")
          .update({ sender: customers!.at(0)?.id })
          .eq("id", params.reference!);
        break;
      case "receiver":
        await supabase
          .from("references")
          .update({ receiver: customers!.at(0)?.id })
          .eq("id", params.reference!);
        break;
      case "customer_3":
        await supabase
          .from("references")
          .update({ customer_3: customers!.at(0)?.id })
          .eq("id", params.reference!);
        break;
      case "customer_4":
        await supabase
          .from("references")
          .update({ customer_4: customers!.at(0)?.id })
          .eq("id", params.reference!);
        break;
      case "customer_5":
        await supabase
          .from("references")
          .update({ customer_5: customers!.at(0)?.id })
          .eq("id", params.reference!);
        break;
    }

    const body =
      "Welcome " +
      customer.name +
      "!\n We are so excited you're here!" +
      "\n Your reference number is " +
      params.reference +
      ".\n Your tracking number: www.smtninternational.com/tracking/" +
      params.reference! +
      ".\n Your invoice can be found here: www.smtninternational.com/tracking/" +
      params.reference! +
      "\n If you have any questions, please visit www.smtninternational.com/faq" +
      "\n If you want to contact us, please visit www.smtninternational.com/contact" +
      "\n Thank you, \n SMTN International";

    sendSms({
      from: process.env.TWILIO_PHONE_NUMBER!,
      to: customer.phone,
      body: body,
    }).catch((err) => console.log(`Twilio Error: ${err}`));
  }

  return redirect(`/dashboard/references/${params.reference}`);
};
