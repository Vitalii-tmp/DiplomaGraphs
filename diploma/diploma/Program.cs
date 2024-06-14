using diploma.Models;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllersWithViews();
builder.Services.AddScoped<IAddressService, AddressService>();
builder.Services.AddScoped<ICoordinatesService, CoordinatesService>();
builder.Services.AddScoped<ITSPSolverService, TSPSolverService>();

// Configure logging
builder.Logging.ClearProviders();
builder.Logging.AddConsole();
builder.Logging.AddDebug(); // Додайте Debug провайдер для додаткових логів


var app = builder.Build();
app.Logger.LogInformation("Adding Routes");


// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Home/Error");
    // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles();

app.UseRouting();

app.UseAuthorization();

app.MapControllerRoute(
    name: "SaveCoordinates",
    pattern: "Coordinates/Save",
    defaults: new { controller = "Coordinates", action = "Save" }
);
app.MapControllerRoute(
    name: "SaveCoordinates",
    pattern: "Coordinates/SaveAddresses",
    defaults: new { controller = "Coordinates", action = "SaveAddresses" }
);
app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}");

app.MapControllers();


app.Run();

